package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.CheckAccessRequest;
import org.medichain.backend.dto.GrantAccessRequest;
import org.medichain.backend.dto.InsurerViewRequest;
import org.medichain.backend.dto.MintRecordRequest;
import org.medichain.backend.dto.RevokeAccessRequest;
import org.medichain.backend.service.BlockchainService;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<?> mintRecord(@RequestBody MintRecordRequest request) {
		try {
			log.info("Received REST API request to MINT record.");
			String txHash = blockchainService.mintMedicalRecord(request.getPatientAddress(), request.getCid(), request.getPreviousRecordId());
			return ResponseEntity.ok(Map.of(
					"status", "success",
					"transactionHash", txHash
			));
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
	
	@PostMapping("/check-access")
	public ResponseEntity<?> checkAccess(@RequestBody CheckAccessRequest request) {
		try {
			log.info("Received REST API request to CHECK ACCESS.");
			
			boolean isAuthorized = blockchainService.checkRecordAccess(
					request.getPatientAddress(),
					request.getDoctorAddress(),
					request.getRecordId()
			);
			
			if (isAuthorized) {
				return ResponseEntity.ok(Map.of(
						"status", "success",
						"authorized", true,
						"message", "Doctor is authorized to view this record."
				));
			} else {
				return ResponseEntity.status(403).body(Map.of(
						"status", "denied",
						"authorized", false,
						"message", "Access denied. The doctor does not have active permission."
				));
			}
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
	
	@PostMapping("/grant-access")
	public ResponseEntity<?> grantAccess(@RequestBody GrantAccessRequest request) {
		try {
			log.info("Received REST API request to GRANT ACCESS.");
			String txHash = blockchainService.grantAccess(
					request.getDoctorAddress(),
					request.getRecordIds(),
					request.getDurationInSeconds()
			);
			return ResponseEntity.ok(Map.of(
					"status", "success",
					"message", "Temporary access granted to doctor.",
					"transactionHash", txHash
			));
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
	
	@PostMapping("/revoke-access")
	public ResponseEntity<?> revokeAccess(@RequestBody RevokeAccessRequest request) {
		try {
			log.info("Received REST API request to REVOKE ACCESS.");
			String txHash = blockchainService.revokeAccess(
					request.getDoctorAddress(),
					request.getRecordId()
			);
			return ResponseEntity.ok(Map.of(
					"status", "success",
					"message", "Access immediately revoked.",
					"transactionHash", txHash
			));
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
	
	@PostMapping("/insurer/view-record")
	public ResponseEntity<?> viewRecordAsInsurer(@RequestBody InsurerViewRequest request) {
		try {
			log.info("Received REST API request: Insurer View Record via DTO.");
			
			Map<String, Object> securePayload = blockchainService.getVerifiedRecordForInsurer(
					request.getInsurerAddress(),
					request.getPatientAddress(),
					request.getRecordId()
			);
			
			return ResponseEntity.ok(Map.of(
					"status", "success",
					"message", "Fraud check passed. Record retrieved successfully.",
					"data", securePayload
			));
			
		} catch (Exception e) {
			if ("ACCESS_DENIED".equals(e.getMessage())) {
				return ResponseEntity.status(403).body(Map.of(
						"status", "error",
						"message", "Access Denied. Patient has not granted access or it has expired."
				));
			}
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
}
