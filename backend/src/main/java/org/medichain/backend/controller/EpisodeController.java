package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.ApiResponse;
import org.medichain.backend.dto.CreateEpisodeRequest;
import org.medichain.backend.entity.Episode;
import org.medichain.backend.service.EpisodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/episodes")
@CrossOrigin(origins = "*")
@Slf4j
public class EpisodeController {

	private final EpisodeService episodeService;

	public EpisodeController(EpisodeService episodeService) {
		this.episodeService = episodeService;
	}

	private String getAuthenticatedWallet() {
		return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	}

	@PostMapping("/create")
	@PreAuthorize("hasRole('DOCTOR')")
	public ResponseEntity<?> createEpisode(@RequestBody CreateEpisodeRequest request) {
		try {
			String doctorAddress = getAuthenticatedWallet();
			Episode ep = episodeService.createEpisode(
					request.getPatientAddress(),
					request.getTitle(),
					request.getDescription(),
					doctorAddress
			);
			return ResponseEntity.ok(ApiResponse.success("Episode created successfully", Map.of(
					"episodeId", ep.getEpisodeId(),
					"patientAddress", ep.getPatientAddress(),
					"title", ep.getTitle(),
					"description", ep.getDescription() != null ? ep.getDescription() : "",
					"createdBy", ep.getCreatedBy(),
					"createdAt", ep.getCreatedAt().toString()
			)));
		} catch (Exception e) {
			log.error("Failed to create episode", e);
			return ResponseEntity.internalServerError().body(ApiResponse.error("CREATE_EPISODE_FAILED", e.getMessage()));
		}
	}

	@GetMapping("/patient")
	@PreAuthorize("hasRole('PATIENT')")
	public ResponseEntity<?> getPatientEpisodes() {
		try {
			String patientAddress = getAuthenticatedWallet();
			Map<String, Object> data = episodeService.getPatientEpisodes(patientAddress);
			return ResponseEntity.ok(ApiResponse.success(data));
		} catch (Exception e) {
			log.error("Failed to fetch episodes", e);
			return ResponseEntity.internalServerError().body(ApiResponse.error("PATIENT_EPISODES_FETCH_FAILED", e.getMessage()));
		}
	}
}
