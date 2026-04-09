package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.CheckInRequest;
import org.medichain.backend.dto.CompleteAppointmentRequest;
import org.medichain.backend.dto.CreateEpisodeRequest;
import org.medichain.backend.entity.Episode;
import org.medichain.backend.service.DashboardService;
import org.medichain.backend.service.EpisodeService;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<?> getPatientVault() {
		try {
			var records = dashboardService.getPatientVault(getAuthenticatedWallet());
			return ResponseEntity.ok(Map.of("status", "success", "data", records));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/patient/check-in")
	public ResponseEntity<?> checkInToClinic(@RequestBody CheckInRequest request) {
		try {
			dashboardService.checkInToClinic(getAuthenticatedWallet(), request.getDoctorAddress());
			return ResponseEntity.ok(Map.of("status", "success", "message", "Checked into clinic waiting room."));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	@GetMapping("/patient/episodes")
	public ResponseEntity<?> getPatientEpisodes() {
		try {
			var result = episodeService.getPatientEpisodes(getAuthenticatedWallet());
			return ResponseEntity.ok(Map.of("status", "success", "data", result));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	// --- DOCTOR ENDPOINTS ---

	@GetMapping("/doctor/waiting-room")
	public ResponseEntity<?> getWaitingRoom() {
		try {
			var waitingPatients = dashboardService.getWaitingRoom(getAuthenticatedWallet());
			return ResponseEntity.ok(Map.of("status", "success", "data", waitingPatients));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	@GetMapping("/doctor/accessible-records/{patientAddress}")
	public ResponseEntity<?> getAccessibleRecords(@PathVariable String patientAddress) {
		try {
			var activeGrants = dashboardService.getAccessibleRecordsForPatient(getAuthenticatedWallet(), patientAddress);
			return ResponseEntity.ok(Map.of("status", "success", "data", activeGrants));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/doctor/complete-appointment")
	public ResponseEntity<?> completeAppointment(@RequestBody CompleteAppointmentRequest request) {
		try {
			dashboardService.completeAppointment(getAuthenticatedWallet(), request.getCheckInId());
			return ResponseEntity.ok(Map.of("status", "success", "message", "Appointment completed."));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/doctor/create-episode")
	public ResponseEntity<?> createEpisode(@RequestBody CreateEpisodeRequest request) {
		try {
			String doctorWallet = getAuthenticatedWallet();
			Episode episode = episodeService.createEpisode(
					request.getPatientAddress(),
					request.getTitle(),
					request.getDescription(),
					doctorWallet
			);
			return ResponseEntity.ok(Map.of("status", "success", "data", Map.of(
					"episodeId", episode.getEpisodeId(),
					"patientAddress", episode.getPatientAddress(),
					"title", episode.getTitle(),
					"description", episode.getDescription() != null ? episode.getDescription() : "",
					"createdBy", episode.getCreatedBy(),
					"createdAt", episode.getCreatedAt().toString()
			)));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	@GetMapping("/patient/check-in-status")
	public ResponseEntity<?> getCheckInStatus() {
		try {
			var checkIn = dashboardService.getPatientActiveCheckIn(getAuthenticatedWallet());
			return ResponseEntity.ok(Map.of("status", "success", "data", checkIn != null ? checkIn : ""));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/patient/leave-room")
	public ResponseEntity<?> leaveWaitingRoom() {
		try {
			dashboardService.leaveWaitingRoom(getAuthenticatedWallet());
			return ResponseEntity.ok(Map.of("status", "success", "message", "Left the waiting room."));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
}

