package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.*;
import org.medichain.backend.entity.Episode;
import org.medichain.backend.service.BlockchainService;
import org.medichain.backend.service.DashboardService;
import org.medichain.backend.service.EpisodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
@Slf4j
public class DashboardController {

	private final DashboardService dashboardService;
	private final EpisodeService episodeService;
	private final BlockchainService blockchainService;

	public DashboardController(DashboardService dashboardService, EpisodeService episodeService, BlockchainService blockchainService) {
		this.dashboardService = dashboardService;
		this.episodeService = episodeService;
		this.blockchainService = blockchainService;
	}

	private String getAuthenticatedWallet() {
		return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	}

	// ========================== PATIENT ENDPOINTS ==========================

	@GetMapping("/patient/vault")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> getPatientVault() {
		try {
			var records = dashboardService.getPatientVault(getAuthenticatedWallet());
			return ResponseEntity.ok(ApiResponse.success(records));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("PATIENT_VAULT_FETCH_FAILED", e.getMessage()));
		}
	}
	
	@PostMapping("/patient/check-in")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> checkInToClinic(@RequestBody CheckInRequest request) {
		try {
			dashboardService.checkInToClinic(getAuthenticatedWallet(), request.getDoctorAddress());
			return ResponseEntity.ok(ApiResponse.success("Checked into clinic waiting room.", Map.of()));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("CHECKIN_FAILED", e.getMessage()));
		}
	}
	
	@GetMapping("/patient/episodes")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> getPatientEpisodes() {
		try {
			var result = episodeService.getPatientEpisodes(getAuthenticatedWallet());
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("PATIENT_EPISODES_FETCH_FAILED", e.getMessage()));
		}
	}
	
	/**
	 * Grant time-bound access to a specific doctor for specific records.
	 * Frontend expects: POST /api/v1/dashboard/patient/grant-access
	 */
	@PostMapping("/patient/grant-access")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> grantAccess(@RequestBody GrantAccessRequest request) {
		try {
			String txHash = blockchainService.grantAccess(
					request.getDoctorAddress(), request.getRecordIds(), request.getDurationInSeconds()
			);
			log.info("Access granted — tx: {}", txHash);
			return ResponseEntity.ok(ApiResponse.success("Access granted successfully.", Map.of("txHash", txHash)));
		} catch (Exception e) {
			log.error("Grant access failed: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(ApiResponse.error("GRANT_ACCESS_FAILED", e.getMessage()));
		}
	}
	
	/**
	 * Revoke access from a specific doctor for a specific record.
	 * Frontend expects: POST /api/v1/dashboard/patient/revoke-access
	 */
	@PostMapping("/patient/revoke-access")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> revokeAccess(@RequestBody RevokeAccessRequest request) {
		try {
			String txHash = blockchainService.revokeAccess(request.getDoctorAddress(), request.getRecordId());
			return ResponseEntity.ok(ApiResponse.success("Access revoked.", Map.of("txHash", txHash)));
		} catch (Exception e) {
			log.error("Revoke access failed: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(ApiResponse.error("REVOKE_ACCESS_FAILED", e.getMessage()));
		}
	}
	
	/**
	 * Leave clinic waiting room.
	 * Frontend expects: POST /api/v1/dashboard/patient/leave-clinic
	 */
	@PostMapping("/patient/leave-clinic")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> leaveClinic() {
		try {
			dashboardService.leaveWaitingRoom(getAuthenticatedWallet());
			return ResponseEntity.ok(ApiResponse.success("Left the waiting room.", Map.of()));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("LEAVE_CLINIC_FAILED", e.getMessage()));
		}
	}
	
	@GetMapping("/patient/check-in-status")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> getCheckInStatus() {
		try {
			var checkIn = dashboardService.getPatientActiveCheckIn(getAuthenticatedWallet());
			return ResponseEntity.ok(ApiResponse.success(checkIn != null ? checkIn : ""));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("CHECKIN_STATUS_FETCH_FAILED", e.getMessage()));
		}
	}

	// ========================== DOCTOR ENDPOINTS ==========================

	@GetMapping("/doctor/waiting-room")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> getWaitingRoom() {
		try {
			var waitingPatients = dashboardService.getWaitingRoom(getAuthenticatedWallet());
			return ResponseEntity.ok(ApiResponse.success(waitingPatients));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("WAITING_ROOM_FETCH_FAILED", e.getMessage()));
		}
	}
	
	@GetMapping("/doctor/accessible-records/{patientAddress}")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> getAccessibleRecords(@PathVariable String patientAddress) {
		try {
			var activeGrants = dashboardService.getAccessibleRecordsForPatient(getAuthenticatedWallet(), patientAddress);
			return ResponseEntity.ok(ApiResponse.success(activeGrants));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("ACCESSIBLE_RECORDS_FETCH_FAILED", e.getMessage()));
		}
	}
	
	@GetMapping("/doctor/episodes/{patientAddress}")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> getDoctorPatientEpisodes(@PathVariable String patientAddress) {
		try {
			var result = episodeService.getPatientEpisodes(patientAddress);
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("DOCTOR_EPISODES_FETCH_FAILED", e.getMessage()));
		}
	}
	
	/**
	 * Mint a new medical record directly to a patient's wallet.
	 * Frontend expects: POST /api/v1/dashboard/doctor/mint-record
	 */
	@PostMapping("/doctor/mint-record")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> mintRecord(@RequestBody MintRecordRequest request) {
		try {
			var result = blockchainService.mintMedicalRecord(
					request.getPatientAddress(),
					request.getCid(),
					request.getPreviousRecordId(),
					request.getRecordType(),
					request.getEpisodeId()
			);
			return ResponseEntity.ok(ApiResponse.success("Record minted successfully.", result));
		} catch (Exception e) {
			log.error("Mint record failed: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(ApiResponse.error("MINT_RECORD_FAILED", e.getMessage()));
		}
	}
	
	/**
	 * Amend (supersede) an existing record with a new version.
	 * Frontend expects: POST /api/v1/dashboard/doctor/amend-record
	 * Under the hood, this is a mint with a non-null previousRecordId.
	 */
	@PostMapping("/doctor/amend-record")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> amendRecord(@RequestBody MintRecordRequest request) {
		try {
			if (request.getPreviousRecordId() == null) {
				return ResponseEntity.badRequest().body(ApiResponse.error("AMEND_RECORD_FAILED", "previousRecordId is required for amendments."));
			}
			var result = blockchainService.mintMedicalRecord(
					request.getPatientAddress(),
					request.getCid(),
					request.getPreviousRecordId(),
					request.getRecordType(),
					request.getEpisodeId()
			);
			return ResponseEntity.ok(ApiResponse.success("Record amended successfully.", result));
		} catch (Exception e) {
			log.error("Amend record failed: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(ApiResponse.error("AMEND_RECORD_FAILED", e.getMessage()));
		}
	}
	
	@PostMapping("/doctor/complete-appointment")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> completeAppointment(@RequestBody CompleteAppointmentRequest request) {
		try {
			dashboardService.completeAppointment(getAuthenticatedWallet(), request.getCheckInId());
			return ResponseEntity.ok(ApiResponse.success("Appointment completed.", Map.of()));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("COMPLETE_APPOINTMENT_FAILED", e.getMessage()));
		}
	}
	
	@PostMapping("/doctor/create-episode")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> createEpisode(@RequestBody CreateEpisodeRequest request) {
		try {
			String doctorWallet = getAuthenticatedWallet();
			Episode episode = episodeService.createEpisode(
					request.getPatientAddress(),
					request.getTitle(),
					request.getDescription(),
					doctorWallet
			);
			return ResponseEntity.ok(ApiResponse.success("Episode created.", Map.of(
					"episodeId", episode.getEpisodeId(),
					"patientAddress", episode.getPatientAddress(),
					"title", episode.getTitle(),
					"description", episode.getDescription() != null ? episode.getDescription() : "",
					"createdBy", episode.getCreatedBy(),
					"createdAt", episode.getCreatedAt().toString()
			)));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("CREATE_EPISODE_FAILED", e.getMessage()));
		}
	}

	// ========================== INSURER ENDPOINTS ==========================

	/**
	 * Run the Triple-Check verification on a single record.
	 * Frontend expects: GET /api/v1/dashboard/insurer/verify-record
	 */
	@GetMapping("/insurer/verify-record")
	@PreAuthorize("hasRole('INSURER')")
	public ResponseEntity<?> verifyRecord(
			@RequestParam String patientAddress,
			@RequestParam Long recordId) {
		try {
			String insurerAddress = getAuthenticatedWallet();
			var result = blockchainService.getVerifiedRecordForInsurer(insurerAddress, patientAddress, recordId);
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			log.error("Verify record failed: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(ApiResponse.error("VERIFY_RECORD_FAILED", e.getMessage()));
		}
	}
	
	/**
	 * Run the Triple-Check verification on an entire episode.
	 * Frontend expects: GET /api/v1/dashboard/insurer/verify-episode
	 */
	@GetMapping("/insurer/verify-episode")
	@PreAuthorize("hasRole('INSURER')")
	public ResponseEntity<?> verifyEpisode(
			@RequestParam String patientAddress,
			@RequestParam Long episodeId) {
		try {
			String insurerAddress = getAuthenticatedWallet();
			var result = blockchainService.verifyEpisodeForInsurer(insurerAddress, patientAddress, episodeId);
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			log.error("Verify episode failed: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(ApiResponse.error("VERIFY_EPISODE_FAILED", e.getMessage()));
		}
	}
}
