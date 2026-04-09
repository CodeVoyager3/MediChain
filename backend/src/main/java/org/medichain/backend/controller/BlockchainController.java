package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.ApiResponse;
import org.medichain.backend.dto.CheckAccessRequest;
import org.medichain.backend.dto.GrantAccessRequest;
import org.medichain.backend.dto.InsurerVerifyEpisodeRequest;
import org.medichain.backend.dto.InsurerViewRequest;
import org.medichain.backend.dto.MintRecordRequest;
import org.medichain.backend.dto.RevokeAccessRequest;
import org.medichain.backend.service.BlockchainService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/blockchain")
@CrossOrigin(origins = "*")
@Slf4j
public class BlockchainController {
	
	private final BlockchainService blockchainService;
	
	public BlockchainController(BlockchainService blockchainService) {
		this.blockchainService = blockchainService;
	}
	
	@PostMapping("/mint")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> mintRecord(@RequestBody MintRecordRequest request) {
		try {
			// Pass the recordType and optional episodeId to the service
			String txHash = blockchainService.mintMedicalRecord(
					request.getPatientAddress(),
					request.getCid(),
					request.getPreviousRecordId(),
					request.getRecordType(),
					request.getEpisodeId()
			);
			return ResponseEntity.ok(ApiResponse.success(Map.of("transactionHash", txHash)));
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("MINT_FAILED", e.getMessage()));
		}
	}
	
	@GetMapping("/active-grants")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> getActiveGrants() {
		try {
			String patientWallet = (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			var grants = blockchainService.getActiveGrants(patientWallet);
			return ResponseEntity.ok(ApiResponse.success(grants));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("ACTIVE_GRANTS_FETCH_FAILED", e.getMessage()));
		}
	}
	
	@PostMapping("/check-access")
	public ResponseEntity<?> checkAccess(@RequestBody CheckAccessRequest request) {
		try {
			log.info("Received REST API request to CHECK ACCESS.");
			
			boolean isAuthorized = blockchainService.checkRecordAccessWithSqlEnforcement(
					request.getPatientAddress(),
					request.getDoctorAddress(),
					request.getRecordId()
			);
			
			if (isAuthorized) {
				return ResponseEntity.ok(ApiResponse.success("Doctor is authorized to view this record.", Map.of("authorized", true)));
			} else {
				return ResponseEntity.status(403).body(ApiResponse.error("ACCESS_DENIED", "Access denied. The doctor does not have active permission."));
			}
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("CHECK_ACCESS_FAILED", e.getMessage()));
		}
	}
	
	@PostMapping("/grant-access")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> grantAccess(@RequestBody GrantAccessRequest request) {
		try {
			log.info("Received REST API request to GRANT ACCESS.");
			String txHash = blockchainService.grantAccess(
					request.getDoctorAddress(),
					request.getRecordIds(),
					request.getDurationInSeconds()
			);
			return ResponseEntity.ok(ApiResponse.success("Temporary access granted to doctor.", Map.of("transactionHash", txHash)));
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("GRANT_ACCESS_FAILED", e.getMessage()));
		}
	}
	
	@PostMapping("/revoke-access")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> revokeAccess(@RequestBody RevokeAccessRequest request) {
		try {
			log.info("Received REST API request to REVOKE ACCESS.");
			String txHash = blockchainService.revokeAccess(
					request.getDoctorAddress(),
					request.getRecordId()
			);
			return ResponseEntity.ok(ApiResponse.success("Access immediately revoked.", Map.of("transactionHash", txHash)));
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("REVOKE_ACCESS_FAILED", e.getMessage()));
		}
	}
	
	@PostMapping("/insurer/view-record")
	@PreAuthorize("hasRole('INSURER')")
	public ResponseEntity<?> viewRecordAsInsurer(@RequestBody InsurerViewRequest request) {
		try {
			log.info("Received REST API request: Insurer View Record via DTO.");
			
			Map<String, Object> securePayload = blockchainService.getVerifiedRecordForInsurer(
					request.getInsurerAddress(),
					request.getPatientAddress(),
					request.getRecordId()
			);
			
			return ResponseEntity.ok(ApiResponse.success("Fraud check passed. Record retrieved successfully.", securePayload));
			
		} catch (Exception e) {
			if ("ACCESS_DENIED_SQL_EXPIRED".equals(e.getMessage()) || "ACCESS_DENIED_CHAIN".equals(e.getMessage())) {
				return ResponseEntity.status(403).body(ApiResponse.error("ACCESS_DENIED", "Access denied. Patient has not granted access or it has expired."));
			}
			if ("RECORD_NOT_FOUND".equals(e.getMessage())) {
				return ResponseEntity.status(404).body(ApiResponse.error("RECORD_NOT_FOUND", "Record not found."));
			}
			return ResponseEntity.internalServerError().body(ApiResponse.error("INSURER_VIEW_FAILED", e.getMessage()));
		}
	}

	@PostMapping("/insurer/verify-episode")
	@PreAuthorize("hasRole('INSURER')")
	public ResponseEntity<?> verifyEpisodeAsInsurer(@RequestBody InsurerVerifyEpisodeRequest request) {
		try {
			Map<String, Object> payload = blockchainService.verifyEpisodeForInsurer(
					request.getInsurerAddress(),
					request.getPatientAddress(),
					request.getEpisodeId()
			);
			return ResponseEntity.ok(ApiResponse.success("Episode verification complete.", payload));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(ApiResponse.error("EPISODE_NOT_FOUND", e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("VERIFY_EPISODE_FAILED", e.getMessage()));
		}
	}
}
