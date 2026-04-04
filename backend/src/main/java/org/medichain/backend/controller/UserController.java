package org.medichain.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.dto.UserRegistrationRequest;
import org.medichain.backend.entity.User;
import org.medichain.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {
	
	private final UserRepository userRepository;
	
	public UserController(UserRepository userRepository) {
		this.userRepository = userRepository;
	}
	
	/**
	 * Completes the profile for a user who just logged in via MetaMask for the first time.
	 * Protected Endpoint: Requires a valid JWT.
	 */
	@PostMapping("/register")
	public ResponseEntity<?> completeRegistration(@RequestBody UserRegistrationRequest request) {
		try {
			// 1. SECURE IDENTITY EXTRACTION: Get the wallet address from the validated JWT
			String loggedInWallet = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			
			log.info("Registration attempt for wallet: {}", loggedInWallet);
			
			// 2. Find the skeleton user created during the login (nonce) process
			User user = userRepository.findByWalletAddressIgnoreCase(loggedInWallet)
					.orElseThrow(() -> new RuntimeException("User profile not found. Please login via MetaMask first."));
			
			// 3. Prevent already registered users from overwriting their role
			if (!"UNREGISTERED".equals(user.getRole())) {
				return ResponseEntity.badRequest().body(Map.of(
						"status", "error",
						"message", "Profile is already fully registered as a " + user.getRole()
				));
			}
			
			// 4. Update the profile with human-readable data
			user.setName(request.getName());
			user.setRole(request.getRole().toUpperCase());
			
			userRepository.save(user);
			log.info("Profile Completed: {} is now registered as a {}", user.getName(), user.getRole());
			
			return ResponseEntity.ok(Map.of(
					"status", "success",
					"message", "Welcome to MediChain, " + user.getName(),
					"user", user
			));
			
		} catch (Exception e) {
			log.error("Registration error: {}", e.getMessage());
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
	
	/**
	 * Fetches a user's profile data (Name, Role) using their wallet address.
	 * This is useful for the frontend to display "Dr. Sharma" instead of "0x123..."
	 * Protected Endpoint: Requires a valid JWT.
	 */
	@GetMapping("/profile/{walletAddress}")
	public ResponseEntity<?> getUserProfile(@PathVariable String walletAddress) {
		try {
			Optional<User> userOpt = userRepository.findByWalletAddressIgnoreCase(walletAddress);
			
			if (userOpt.isPresent()) {
				return ResponseEntity.ok(Map.of(
						"status", "success",
						"user", userOpt.get()
				));
			} else {
				return ResponseEntity.status(404).body(Map.of(
						"status", "error",
						"message", "User not found."
				));
			}
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
}
