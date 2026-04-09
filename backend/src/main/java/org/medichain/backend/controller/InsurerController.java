package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.ApiResponse;
import org.medichain.backend.dto.InsurerVerifyEpisodeRequest;
import org.medichain.backend.service.BlockchainService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insurer")
@CrossOrigin(origins = "*")
@Slf4j
public class InsurerController {

	private final BlockchainService blockchainService;

	public InsurerController(BlockchainService blockchainService) {
		this.blockchainService = blockchainService;
	}

	/**
	 * AI-powered episode analysis with Trust Score.
	 * Frontend expects: POST /api/insurer/analyze-episode
	 * Orchestrates: Triple-Check + Rule Engine + Gemini LLM → unified Trust Score.
	 */
	@PostMapping("/analyze-episode")
	@PreAuthorize("hasRole('INSURER')")
	public ResponseEntity<?> analyzeEpisode(@RequestBody InsurerVerifyEpisodeRequest request) {
		try {
			String insurerAddress = (String) org.springframework.security.core.context.SecurityContextHolder
					.getContext().getAuthentication().getPrincipal();
			log.info("Insurer {} analyzing episode {} for patient {}", insurerAddress, request.getEpisodeId(), request.getPatientAddress());
			var result = blockchainService.verifyEpisodeForInsurer(
					insurerAddress,
					request.getPatientAddress(),
					request.getEpisodeId()
			);
			return ResponseEntity.ok(ApiResponse.success(result));
		} catch (Exception e) {
			log.error("Episode analysis failed: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(ApiResponse.error("EPISODE_ANALYSIS_FAILED", e.getMessage()));
		}
	}
}
