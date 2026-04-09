package org.medichain.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "access_grants")
@Data
public class AccessGrant {
	
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	
	@Column(name = "patient_address", nullable = false, length = 42)
	private String patientAddress;
	
	@Column(name = "viewer_address", nullable = false, length = 42)
	private String viewerAddress; // The Doctor or Insurer
	
	@Column(name = "record_id", nullable = false)
	private Long recordId;
	
	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;
	
	@Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
	private boolean isActive = true;
}
