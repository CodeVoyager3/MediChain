package org.medichain.backend.repository;

import org.medichain.backend.entity.AccessGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccessGrantRepository extends JpaRepository<AccessGrant, UUID> {
	
	// For the Patient's "Access Manager" tab (shows who they have granted access to)
	List<AccessGrant> findByPatientAddressIgnoreCase(String patientAddress);
	
	// Active grants for a patient (not revoked, not expired)
	List<AccessGrant> findByPatientAddressIgnoreCaseAndIsActiveTrueAndExpiresAtAfter(String patientAddress, LocalDateTime currentTime);
	
	// For the Doctor's Portal (shows all active records they are allowed to view right now)
	List<AccessGrant> findByViewerAddressIgnoreCaseAndIsActiveTrueAndExpiresAtAfter(String viewerAddress, LocalDateTime currentTime);
	
	// Find grants for revocation
	List<AccessGrant> findByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordId(
			String patientAddress, String viewerAddress, Long recordId);
	
	// Fetch active grants for a SPECIFIC patient and doctor combination
	List<AccessGrant> findByViewerAddressIgnoreCaseAndPatientAddressIgnoreCaseAndIsActiveTrueAndExpiresAtAfter(
			String viewerAddress, String patientAddress, LocalDateTime currentTime);

	boolean existsByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordIdAndIsActiveTrueAndExpiresAtAfter(
			String patientAddress, String viewerAddress, Long recordId, LocalDateTime currentTime);
}

