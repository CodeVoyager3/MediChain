package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.AuthNonceRequest;
import org.medichain.backend.dto.AuthVerifyRequest;
import org.medichain.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {
	
	private final AuthService authService;
	
	public AuthController(AuthService authService) {
		this.authService = authService;
	}
	
	// Step 1: Frontend asks for a unique message to sign
	@PostMapping("/nonce")
	public ResponseEntity<?> getNonce(@RequestBody AuthNonceRequest request) {
		try {
			log.info("Requesting auth nonce for wallet: {}", request.getWalletAddress());
			
			String messageToSign = authService.generateNonce(request.getWalletAddress());
			
			return ResponseEntity.ok(Map.of(
					"status", "success",
					"messageToSign", messageToSign
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
	
	// Step 2: Frontend sends the signature to get a JWT
	@PostMapping("/verify")
	public ResponseEntity<?> verifySignature(@RequestBody AuthVerifyRequest request) {
		try {
			log.info("Verifying cryptographic signature for wallet: {}", request.getWalletAddress());
			
			Map<String, String> result = authService.verifySignatureAndIssueJwt(
					request.getWalletAddress(),
					request.getSignature()
			);
			
			return ResponseEntity.ok(Map.of(
					"status", "success",
					"message", "Authentication successful. Welcome to MediChain.",
					"token", result.get("token"),
					"role", result.get("role")
			));
		} catch (Exception e) {
			log.warn("Auth failed for {}: {}", request.getWalletAddress(), e.getMessage());
			// Return 401 Unauthorized if the signature is fake or invalid
			return ResponseEntity.status(401).body(Map.of(
					"status", "error",
					"message", "Authentication failed: Invalid signature or nonce."
			));
		}
	}
}
