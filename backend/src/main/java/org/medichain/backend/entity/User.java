package org.medichain.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
	
	@Id
	@Column(name = "wallet_address", unique = true, nullable = false, length = 42)
	private String walletAddress; // Acts as the Primary Key
	
	private String name;
	
	private String role; // PATIENT, DOCTOR, INSURER, UNREGISTERED
	
	// The secret string they must sign to prove they own the wallet
	@Column(name = "auth_nonce")
	private String nonce;
	
	@Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime createdAt;
	
	@PrePersist
	protected void onCreate() {
		if (this.createdAt == null) {
			this.createdAt = LocalDateTime.now();
		}
	}
}
