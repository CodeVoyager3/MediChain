package org.medichain.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
	
	@Id
	@Column(name = "wallet_address", unique = true, nullable = false, length = 42)
	private String walletAddress; // Acts as the Primary Key
	
	private String name;
	
	private String role; // PATIENT, DOCTOR, INSURER
	
	// The secret string they must sign to prove they own the wallet
	@Column(name = "auth_nonce")
	private String nonce;
}
