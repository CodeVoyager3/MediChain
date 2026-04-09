package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.ApiResponse;
import org.medichain.backend.dto.AuthNonceRequest;
import org.medichain.backend.dto.AuthVerifyRequest;
import org.medichain.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
			
			return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("messageToSign", messageToSign)));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(ApiResponse.error("NONCE_REQUEST_FAILED", e.getMessage()));
		}
	}
	
	// Step 2: Frontend sends the signature to get a JWT
	@PostMapping("/verify")
	public ResponseEntity<?> verifySignature(@RequestBody AuthVerifyRequest request) {
		try {
			log.info("Verifying cryptographic signature for wallet: {}", request.getWalletAddress());
			
			String jwtToken = authService.verifySignatureAndIssueJwt(
					request.getWalletAddress(),
					request.getSignature()
			);
			
			return ResponseEntity.ok(ApiResponse.success("Authentication successful. Welcome to MediChain.",
					java.util.Map.of("token", jwtToken)));
		}
		catch (Exception e) {
			log.warn("Auth failed for {}: {}", request.getWalletAddress(), e.getMessage());
			// Return 401 Unauthorized if the signature is fake or invalid
			return ResponseEntity.status(401)
					.body(ApiResponse.error("AUTH_FAILED", "Authentication failed: Invalid signature or nonce."));
		}
	}

	// Lightweight health check for Uptime Monitors to prevent Render spin-down
	@GetMapping("/health")
	public ResponseEntity<?> healthCheck() {
		return ResponseEntity.ok(ApiResponse.success("MediChain Backend is active."));
	}
}
