package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.CheckInRequest;
import org.medichain.backend.dto.CompleteAppointmentRequest;
import org.medichain.backend.service.DashboardService;
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
	
	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
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
}
