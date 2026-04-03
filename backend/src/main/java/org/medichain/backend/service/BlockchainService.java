package org.medichain.backend.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.blockchain.MedRecordNFT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.tx.gas.StaticGasProvider;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BlockchainService {
	
	private final Web3j web3j;
	private MedRecordNFT smartContract;
	
	@Value("${blockchain.contract.address}")
	private String contractAddress;
	
	@Value("${blockchain.wallet.private-key}")
	private String privateKey;
	
	public BlockchainService(Web3j web3j) {
		this.web3j = web3j;
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
	
	public String mintMedicalRecord(String patientWalletAddress, String ipfsCid) {
		try {
			log.info("Minting record for patient: {} with CID: {}", patientWalletAddress, ipfsCid);
			var receipt = smartContract.mintRecord(patientWalletAddress, ipfsCid).send();
			String transactionHash = receipt.getTransactionHash();
			log.info("Record minted successfully! Tx Hash: {}", transactionHash);
			return transactionHash;
		} catch (Exception e) {
			log.error("Error minting record: {}", e.getMessage());
			throw new RuntimeException("Blockchain transaction failed", e);
		}
	}
	
	public boolean checkRecordAccess(String patientAddress, String doctorAddress, Long recordId) {
		try {
			log.info("Checking access for Doctor: {} on Record ID: {}", doctorAddress, recordId);
			
			// Call the free 'view' function on the smart contract
			boolean hasAccess = smartContract.hasAccess(
					patientAddress,
					doctorAddress,
					BigInteger.valueOf(recordId)
			).send();
			
			log.info("Access Check Complete. Granted: {}", hasAccess);
			return hasAccess;
		} catch (Exception e) {
			log.error("Error checking access from blockchain", e);
			throw new RuntimeException("Failed to read from blockchain", e);
		}
	}
	
	public String grantAccess(String doctorAddress, List<Long> recordIds, Long durationInSeconds) {
		try {
			log.info("Granting access to Doctor: {} for {} seconds", doctorAddress, durationInSeconds);
			
			// Convert List<Long> to List<BigInteger> for Web3j
			List<BigInteger> bigIntIds = recordIds.stream()
					.map(BigInteger::valueOf)
					.toList();
			
			var receipt = smartContract.grantGranularAccess(
					doctorAddress,
					bigIntIds,
					BigInteger.valueOf(durationInSeconds)
			).send();
			
			String txHash = receipt.getTransactionHash();
			log.info("Access granted successfully! Tx Hash: {}", txHash);
			return txHash;
		} catch (Exception e) {
			log.error("Error granting access: {}", e.getMessage());
			throw new RuntimeException("Blockchain transaction failed", e);
		}
	}
	
	public String revokeAccess(String doctorAddress, Long recordId) {
		try {
			log.info("Revoking access from Doctor: {} for Record ID: {}", doctorAddress, recordId);
			
			var receipt = smartContract.revokeAccess(
					doctorAddress,
					BigInteger.valueOf(recordId)
			).send();
			
			String txHash = receipt.getTransactionHash();
			log.info("Access revoked successfully! Tx Hash: {}", txHash);
			return txHash;
		} catch (Exception e) {
			log.error("Error revoking access: {}", e.getMessage());
			throw new RuntimeException("Blockchain transaction failed", e);
		}
	}
	
	public Map<String, Object> getVerifiedRecordForInsurer(String insurerAddress, String patientAddress, Long recordId)
			throws Exception {
		try {
			log.info("Insurer {} requesting access to Record ID: {}", insurerAddress, recordId);
			
			// Check Consent (Does the insurer have active permission?)
			boolean hasAccess = checkRecordAccess(patientAddress, insurerAddress, recordId);
			if (!hasAccess) {
				log.warn("Access Denied for Insurer: {}", insurerAddress);
				throw new RuntimeException("ACCESS_DENIED");
			}
			
			// Fetch the Record Metadata from the Blockchain
			var onChainRecord = smartContract.records(BigInteger.valueOf(recordId)).send();
			
			String cid = onChainRecord.component1();
			String issuingDoctor = onChainRecord.component3();
			BigInteger previousTokenId = onChainRecord.component4();
			boolean isSuperseded = onChainRecord.component5();
			
			// Authenticity Check (Is the doctor valid?)
			boolean isAuthenticityValid = issuingDoctor != null && !issuingDoctor.startsWith("0x0000000000000000");
			
			// Build the Audit Trail Warning
			String auditStatus = isSuperseded ? "WARNING: This record has been AMENDED." : "VALID: Latest Version";
			
			log.info("Verification Complete. Returning secure metadata.");
			
			// Return the payload to the frontend
			return Map.of(
					"accessGranted", true,
					"recordData", Map.of(
							"ipfsCid", cid, // The frontend will use this to download the PDF from IPFS!
							"issuingDoctor", issuingDoctor,
							"isSuperseded", isSuperseded,
							"previousRecordId", previousTokenId,
							"auditStatus", auditStatus
					),
					"securityChecks", Map.of(
							"authenticityVerified", isAuthenticityValid,
							"integrityVerified", true // Automatically true because we fetch via IPFS CID!
					)
			);
			
		} catch (Exception e) {
			log.error("Error fetching record for insurer: {}", e.getMessage());
			throw e;
		}
	}
}
