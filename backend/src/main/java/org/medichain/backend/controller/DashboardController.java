package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.ApiResponse;
import org.medichain.backend.dto.CheckInRequest;
import org.medichain.backend.dto.CompleteAppointmentRequest;
import org.medichain.backend.dto.CreateEpisodeRequest;
import org.medichain.backend.entity.Episode;
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

	public DashboardController(DashboardService dashboardService, EpisodeService episodeService) {
		this.dashboardService = dashboardService;
		this.episodeService = episodeService;
	}

	private String getAuthenticatedWallet() {
		return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	}

	// --- PATIENT ENDPOINTS ---

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

	// --- DOCTOR ENDPOINTS ---

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
			return ResponseEntity.ok(ApiResponse.success(Map.of(
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
	
	@PostMapping("/patient/leave-room")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> leaveWaitingRoom() {
		try {
			dashboardService.leaveWaitingRoom(getAuthenticatedWallet());
			return ResponseEntity.ok(ApiResponse.success("Left the waiting room.", Map.of()));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("LEAVE_WAITING_ROOM_FAILED", e.getMessage()));
		}
	}
}
