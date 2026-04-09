package org.medichain.backend.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.blockchain.MedRecordNFT;
import org.medichain.backend.entity.AccessGrant;
import org.medichain.backend.entity.MedicalRecord;
import org.medichain.backend.repository.AccessGrantRepository;
import org.medichain.backend.repository.MedicalRecordRepository;
import org.medichain.backend.repository.UserRepository;
import org.medichain.backend.repository.EpisodeRepository;
import org.medichain.backend.service.ai.*;
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
	// Triple-check weights used in buildSecurityChecks (V1 legacy display)
	private static final int TRUST_SCORE_PROVIDER = 40;
	private static final int TRUST_SCORE_INTEGRITY = 40;
	private static final int TRUST_SCORE_LATEST = 20;
	private static final int TRUST_SCORE_SUPERSEDED = 10;
	
	private final Web3j web3j;
	private final MedicalRecordRepository medicalRecordRepository;
	private final AccessGrantRepository accessGrantRepository;
	private final UserRepository userRepository;
	private final EpisodeRepository episodeRepository;
	private final EpisodeRuleService episodeRuleService;
	private final GeminiAnalysisService geminiAnalysisService;
	private final EpisodeMetadataBuilder episodeMetadataBuilder;
	private final TrustScoreAggregator trustScoreAggregator;
	
	private MedRecordNFT smartContract;
	
	@Value("${blockchain.contract.address}")
	private String contractAddress;
	
	@Value("${blockchain.wallet.private-key}")
	private String privateKey;
	
	public BlockchainService(Web3j web3j,
			MedicalRecordRepository medicalRecordRepository,
			AccessGrantRepository accessGrantRepository,
			UserRepository userRepository,
			EpisodeRepository episodeRepository,
			EpisodeRuleService episodeRuleService,
			GeminiAnalysisService geminiAnalysisService,
			EpisodeMetadataBuilder episodeMetadataBuilder,
			TrustScoreAggregator trustScoreAggregator) {
		this.web3j = web3j;
		this.medicalRecordRepository = medicalRecordRepository;
		this.accessGrantRepository = accessGrantRepository;
		this.userRepository = userRepository;
		this.episodeRepository = episodeRepository;
		this.episodeRuleService = episodeRuleService;
		this.geminiAnalysisService = geminiAnalysisService;
		this.episodeMetadataBuilder = episodeMetadataBuilder;
		this.trustScoreAggregator = trustScoreAggregator;
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
			record.setEpisodeId(episodeId);
			record.setTxHash(transactionHash);
			
			medicalRecordRepository.save(record);
			return transactionHash;
		} catch (Exception e) {
			throw new RuntimeException("Blockchain transaction failed", e);
		}
	}
	
	public List<AccessGrant> getActiveGrants(String patientAddress) {
		return accessGrantRepository.findByPatientAddressIgnoreCaseAndIsActiveTrueAndExpiresAtAfter(
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
			
			// Soft-delete: set is_active = false instead of removing rows (preserves audit history)
			List<AccessGrant> grantsToRevoke = accessGrantRepository.findByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordId(
					patientAddress, doctorAddress, recordId
			);
			for (AccessGrant grant : grantsToRevoke) {
				grant.setActive(false);
				accessGrantRepository.save(grant);
			}
			
			log.info("Access revoked (is_active=false)! Tx Hash: {}", txHash);
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

	public boolean checkRecordAccessWithSqlEnforcement(String patientAddress, String viewerAddress, Long recordId) {
		if (!hasActiveSqlGrant(patientAddress, viewerAddress, recordId)) {
			return false;
		}
		return checkRecordAccess(patientAddress, viewerAddress, recordId);
	}
	
	public Map<String, Object> getVerifiedRecordForInsurer(String insurerAddress, String patientAddress, Long recordId) {
		try {
			log.info("Insurer {} requesting access to Record ID: {}", insurerAddress, recordId);
			if (!hasActiveSqlGrant(patientAddress, insurerAddress, recordId)) {
				throw new RuntimeException("ACCESS_DENIED_SQL_EXPIRED");
			}
			boolean hasAccess = checkRecordAccess(patientAddress, insurerAddress, recordId);
			if (!hasAccess) throw new RuntimeException("ACCESS_DENIED_CHAIN");

			MedicalRecord localRecord = medicalRecordRepository.findById(recordId)
					.orElseThrow(() -> new RuntimeException("RECORD_NOT_FOUND"));
			Map<String, Object> securityChecks = buildSecurityChecks(localRecord, recordId);
			List<MedicalRecord> history = getFullAuditTrail(recordId);
			Map<String, Object> recordData = (Map<String, Object>) securityChecks.get("recordData");

			return Map.of(
					"accessGranted", true,
					"recordData", recordData,
					"securityChecks", securityChecks,
					"auditTrail", history
			);
		} catch (Exception e) {
			log.error("Error fetching record for insurer: {}", e.getMessage());
			throw new RuntimeException(e.getMessage(), e);
		}
	}

	public Map<String, Object> verifyEpisodeForInsurer(String insurerAddress, String patientAddress, Long episodeId) {
		List<MedicalRecord> records = medicalRecordRepository.findByPatientAddressIgnoreCaseAndEpisodeIdOrderByRecordIdDesc(
				patientAddress, episodeId
		);
		if (records.isEmpty()) {
			throw new IllegalArgumentException("No records found for this episode.");
		}

		List<Map<String, Object>> verifiedRecords = new ArrayList<>();
		int successCount = 0;
		int deniedCount = 0;

		for (MedicalRecord record : records) {
			Long recordId = record.getRecordId();
			boolean hasSqlGrant = hasActiveSqlGrant(patientAddress, insurerAddress, recordId);
			if (!hasSqlGrant) {
				verifiedRecords.add(Map.of(
						"recordId", recordId,
						"accessGranted", false,
						"reason", "Access denied. SQL grant missing or expired."
				));
				deniedCount++;
				continue;
			}

			boolean hasChainAccess = checkRecordAccess(patientAddress, insurerAddress, recordId);
			if (!hasChainAccess) {
				verifiedRecords.add(Map.of(
						"recordId", recordId,
						"accessGranted", false,
						"reason", "Access denied on blockchain."
				));
				deniedCount++;
				continue;
			}

			try {
				Map<String, Object> securityChecks = buildSecurityChecks(record, recordId);
				Map<String, Object> recordData = (Map<String, Object>) securityChecks.get("recordData");
				verifiedRecords.add(Map.of(
						"recordId", recordId,
						"accessGranted", true,
						"recordData", recordData,
						"securityChecks", securityChecks,
						"auditTrail", getFullAuditTrail(recordId)
				));
				successCount++;
			} catch (Exception e) {
				verifiedRecords.add(Map.of(
						"recordId", recordId,
						"accessGranted", false,
						"reason", "Verification failed: " + e.getMessage()
				));
				deniedCount++;
			}
		}

		Map<String, Object> basePayload = Map.of(
				"episodeId", episodeId,
				"patientAddress", patientAddress,
				"totalRecords", records.size(),
				"verifiedCount", successCount,
				"deniedCount", deniedCount,
				"records", verifiedRecords
		);
		
		// If records were verified, calculate Trust Score
		if (successCount > 0) {
			try {
				org.medichain.backend.entity.Episode episode = episodeRepository.findById(episodeId).orElse(null);
				var ruleResult = episodeRuleService.analyzeRecords(records);
				
				Map<String, Object> llmFindings;
				Map<String, Object> metaJson;
				
				if (episode != null) {
					metaJson = episodeMetadataBuilder.buildMetadata(episode, records);
				} else {
					log.warn("Episode [{}] not found in DB. Falling back to records-only metadata for AI analysis.", episodeId);
					metaJson = Map.of(
							"episodeId", episodeId,
							"patientAddress", patientAddress,
							"note", "Missing formal Episode metadata, analyzing raw records."
							// Passing full records object explicitly might be too big, we rely on the rule engine findings mostly during fallback
					);
				}
				
				log.info("Triggering AI Analysis (Gemini) for Episode {}. Rule Engine Score: {}", episodeId, ruleResult.getScore());
				llmFindings = geminiAnalysisService.analyze(metaJson, ruleResult.getFindings());
				
				log.info("AI Analysis completed. Risk Level: {}, Confidence: {}", llmFindings.get("risk_level"), llmFindings.get("confidence"));
				
				// Take the first verified record's base score as an indicator, or sum them. For now, max 40 via our logic map.
				Map<String, Object> firstValidChecks = (Map<String, Object>) verifiedRecords.get(0).get("securityChecks");
				Map<String, Object> finalTrust = trustScoreAggregator.aggregate(firstValidChecks, ruleResult, llmFindings);
				
				Map<String, Object> enrichedPayload = new java.util.HashMap<>(basePayload);
				enrichedPayload.put("trustScoreResult", finalTrust);
				return enrichedPayload;
			} catch (Exception e) {
				log.error("AI Compilation failed: {}", e.getMessage());
			}
		}

		return basePayload;
	}

	boolean hasActiveSqlGrant(String patientAddress, String viewerAddress, Long recordId) {
		return accessGrantRepository.existsByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordIdAndIsActiveTrueAndExpiresAtAfter(
				patientAddress, viewerAddress, recordId, LocalDateTime.now()
		);
	}

	private Map<String, Object> buildSecurityChecks(MedicalRecord localRecord, Long recordId) throws Exception {
		var onChainRecord = smartContract.records(BigInteger.valueOf(recordId)).send();
		String cid = onChainRecord.component1();
		String issuingDoctor = onChainRecord.component3();
		BigInteger previousTokenId = onChainRecord.component4();
		boolean isSuperseded = onChainRecord.component5();

		String resolvedDoctor = (issuingDoctor != null && !issuingDoctor.startsWith("0x0000000000000000"))
				? issuingDoctor
				: localRecord.getDoctorAddress();
		boolean providerVerified = resolvedDoctor != null
				&& userRepository.findByWalletAddressIgnoreCase(resolvedDoctor)
				.map(u -> "DOCTOR".equalsIgnoreCase(u.getRole()))
				.orElse(false);
		boolean integrityValid = cid != null && cid.equalsIgnoreCase(localRecord.getIpfsCid());
		boolean isLatestVersion = !isSuperseded;
		int trustScore = (providerVerified ? TRUST_SCORE_PROVIDER : 0)
				+ (integrityValid ? TRUST_SCORE_INTEGRITY : 0)
				+ (isLatestVersion ? TRUST_SCORE_LATEST : TRUST_SCORE_SUPERSEDED);
		String auditStatus = isSuperseded ? "WARNING: This record has been AMENDED." : "VALID: Latest Version";

		return Map.of(
				"providerVerified", providerVerified,
				"integrityValid", integrityValid,
				"isLatestVersion", isLatestVersion,
				"authenticityVerified", providerVerified,
				"integrityVerified", integrityValid,
				"trustScore", trustScore,
				"recordData", Map.of(
						"ipfsCid", cid,
						"issuingDoctor", resolvedDoctor,
						"isSuperseded", isSuperseded,
						"previousRecordId", previousTokenId,
						"auditStatus", auditStatus
				)
		);
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
