package org.medichain.backend.dto;

import lombok.Data;

@Data
public class UserRegistrationRequest {
	// We removed walletAddress because the backend gets it securely from the JWT
	private String name;
	private String role; //PATIENT or DOCTOR
}
