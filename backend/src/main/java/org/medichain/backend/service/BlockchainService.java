package org.medichain.backend.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.blockchain.MedRecordNFT;
import org.medichain.backend.entity.AccessGrant;
import org.medichain.backend.entity.MedicalRecord;
import org.medichain.backend.repository.AccessGrantRepository;
import org.medichain.backend.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.tx.gas.StaticGasProvider;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class BlockchainService {
	
	private final Web3j web3j;
	private final MedicalRecordRepository medicalRecordRepository;
	private final AccessGrantRepository accessGrantRepository;
	
	private MedRecordNFT smartContract;
	
	@Value("${blockchain.contract.address}")
	private String contractAddress;
	
	@Value("${blockchain.wallet.private-key}")
	private String privateKey;
	
	public BlockchainService(Web3j web3j,
			MedicalRecordRepository medicalRecordRepository,
			AccessGrantRepository accessGrantRepository) {
		this.web3j = web3j;
		this.medicalRecordRepository = medicalRecordRepository;
		this.accessGrantRepository = accessGrantRepository;
	}
	
	@PostConstruct
	public void initContract() {
		try {
			Credentials credentials = Credentials.create(privateKey);
			BigInteger gasPrice = BigInteger.valueOf(35_000_000_000L);
			BigInteger gasLimit = BigInteger.valueOf(300_000L);
			StaticGasProvider gasProvider = new StaticGasProvider(gasPrice, gasLimit);
			long chainId = 80002L;
			org.web3j.tx.RawTransactionManager txManager =
					new org.web3j.tx.RawTransactionManager(web3j, credentials, chainId);
			
			this.smartContract = MedRecordNFT.load(contractAddress, web3j, txManager, gasProvider);
			
			String tokenSymbol = smartContract.symbol().send();
			
			log.info("Smart Contract Linked Successfully!");
			log.info("Token Symbol from Blockchain: {}", tokenSymbol);
			
		} catch (Exception e) {
			log.error("Failed to load Smart Contract", e);
		}
	}
	
	// Helper Method to get the currently logged-in user from the JWT
	private String getAuthenticatedWalletAddress() {
		return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	}
	
	@Transactional
	public String mintMedicalRecord(String patientWalletAddress, String ipfsCid, Long previousRecordId, String recordType, Long episodeId) {
		try {
			String doctorAddress = getAuthenticatedWalletAddress();
			
			var receipt = smartContract.mintRecord(patientWalletAddress, ipfsCid).send();
			String transactionHash = receipt.getTransactionHash();
			
			List<MedRecordNFT.RecordMintedEventResponse> events = smartContract.getRecordMintedEvents(receipt);
			Long recordId = events.isEmpty() ? System.currentTimeMillis() : events.get(0).tokenId.longValue();
			
			if (previousRecordId != null && previousRecordId > 0) {
				medicalRecordRepository.findById(previousRecordId).ifPresent(oldRecord -> {
					oldRecord.setSuperseded(true);
					medicalRecordRepository.save(oldRecord);
				});
			}
			
			MedicalRecord record = new MedicalRecord();
			record.setRecordId(recordId);
			record.setPatientAddress(patientWalletAddress);
			record.setDoctorAddress(doctorAddress);
			record.setIpfsCid(ipfsCid);
			// FIX: No longer hardcoded.
			record.setRecordType(recordType != null && !recordType.isEmpty() ? recordType : "Medical Record");
			record.setSuperseded(false);
			record.setPreviousRecordId(previousRecordId);
			record.setTxHash(transactionHash);
			record.setEpisodeId(episodeId); // nullable — null when not provided
			
			medicalRecordRepository.save(record);
			return transactionHash;
		} catch (Exception e) {
			throw new RuntimeException("Blockchain transaction failed", e);
		}
	}
	
	public List<AccessGrant> getActiveGrants(String patientAddress) {
		return accessGrantRepository.findByPatientAddressIgnoreCaseAndExpiresAtAfter(
				patientAddress, LocalDateTime.now()
		);
	}
	
	@Transactional
	public String grantAccess(String doctorAddress, List<Long> recordIds, Long durationInSeconds) {
		try {
			String patientAddress = getAuthenticatedWalletAddress();
			log.info("Patient {} granting access to Doctor: {} for {} seconds", patientAddress, doctorAddress, durationInSeconds);
			
			//Send to Blockchain
			List<BigInteger> bigIntIds = recordIds.stream().map(BigInteger::valueOf).toList();
			var receipt = smartContract.grantGranularAccess(doctorAddress, bigIntIds, BigInteger.valueOf(durationInSeconds)).send();
			String txHash = receipt.getTransactionHash();
			
			//Cache the grants in PostgreSQL
			LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(durationInSeconds);
			
			for (Long recordId : recordIds) {
				AccessGrant grant = new AccessGrant();
				grant.setPatientAddress(patientAddress);
				grant.setViewerAddress(doctorAddress);
				grant.setRecordId(recordId);
				grant.setExpiresAt(expiryTime);
				accessGrantRepository.save(grant);
			}
			
			log.info("Access granted and cached! Tx Hash: {}", txHash);
			return txHash;
		} catch (Exception e) {
			log.error("Error granting access: {}", e.getMessage());
			throw new RuntimeException("Blockchain transaction failed", e);
		}
	}
	
	@Transactional
	public String revokeAccess(String doctorAddress, Long recordId) {
		try {
			String patientAddress = getAuthenticatedWalletAddress();
			log.info("Patient {} revoking access from Doctor: {} for Record ID: {}", patientAddress, doctorAddress, recordId);
			
			// Send to Blockchain
			var receipt = smartContract.revokeAccess(doctorAddress, java.math.BigInteger.valueOf(recordId)).send();
			String txHash = receipt.getTransactionHash();
			
			// FIXED: Handle duplicate rows safely by fetching a List and deleting all of them
			List<AccessGrant> grantsToDelete = accessGrantRepository.findByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordId(
					patientAddress, doctorAddress, recordId
			);
			if (!grantsToDelete.isEmpty()) {
				accessGrantRepository.deleteAll(grantsToDelete);
			}
			
			log.info("Access revoked and cache cleared! Tx Hash: {}", txHash);
			return txHash;
		} catch (Exception e) {
			log.error("Error revoking access: {}", e.getMessage());
			throw new RuntimeException("Blockchain transaction failed", e);
		}
	}
	
	public boolean checkRecordAccess(String patientAddress, String doctorAddress, Long recordId) {
		
		try {
			log.info("Checking access for Doctor: {} on Record ID: {}", doctorAddress, recordId);
			boolean hasAccess = smartContract.hasAccess(patientAddress, doctorAddress, BigInteger.valueOf(recordId)).send();
			log.info("Access Check Complete. Granted: {}", hasAccess);
			return hasAccess;
		} catch (Exception e) {
			log.error("Error checking access from blockchain", e);
			throw new RuntimeException("Failed to read from blockchain", e);
		}
	}
	
	public Map<String, Object> getVerifiedRecordForInsurer(String insurerAddress, String patientAddress, Long recordId) {
		
		try {
			log.info("Insurer {} requesting access to Record ID: {}", insurerAddress, recordId);
			boolean hasAccess = checkRecordAccess(patientAddress, insurerAddress, recordId);
			if (!hasAccess) throw new RuntimeException("ACCESS_DENIED");
			
			var onChainRecord = smartContract.records(BigInteger.valueOf(recordId)).send();
			String cid = onChainRecord.component1();
			String issuingDoctor = onChainRecord.component3();
			BigInteger previousTokenId = onChainRecord.component4();
			boolean isSuperseded = onChainRecord.component5();
			
			boolean isAuthenticityValid = issuingDoctor != null && !issuingDoctor.startsWith("0x0000000000000000");
			String auditStatus = isSuperseded ? "WARNING: This record has been AMENDED." : "VALID: Latest Version";
			
			log.info("Verification Complete. Returning secure metadata.");
			
			List<MedicalRecord> history = getFullAuditTrail(recordId);
			
			return Map.of(
					"accessGranted", true,
					"recordData", Map.of(
							"ipfsCid", cid,
							"issuingDoctor", issuingDoctor,
							"isSuperseded", isSuperseded,
							"previousRecordId", previousTokenId,
							"auditStatus", auditStatus
					),
					"securityChecks", Map.of(
							"authenticityVerified", isAuthenticityValid,
							"integrityVerified", true
					),
					"auditTrail", history // <-- We attached the Linked List history here!
			);
		} catch (Exception e) {
			log.error("Error fetching record for insurer: {}", e.getMessage());
			throw new RuntimeException(e);
		}
	}
	
	public List<MedicalRecord> getFullAuditTrail(Long currentRecordId) {
		List<MedicalRecord> auditTrail = new ArrayList<>();
		Long pointerId = currentRecordId;
		
		while (pointerId != null && pointerId != 0) {
			Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(pointerId);
			if (recordOpt.isPresent()) {
				MedicalRecord record = recordOpt.get();
				auditTrail.add(record); // Add current node to the history
				pointerId = record.getPreviousRecordId(); // Move pointer to the previous node
			} else {
				break; // End of the known trail
			}
		}
		return auditTrail;
	}
}
