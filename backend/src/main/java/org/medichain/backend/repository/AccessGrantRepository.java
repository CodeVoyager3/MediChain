package org.medichain.backend.repository;

import org.medichain.backend.entity.AccessGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccessGrantRepository extends JpaRepository<AccessGrant, UUID> {
	
	// For the Patient's "Access Manager" tab (shows who they have granted access to)
	List<AccessGrant> findByPatientAddressIgnoreCase(String patientAddress);
	
	List<AccessGrant> findByPatientAddressIgnoreCaseAndExpiresAtAfter(String patientAddress, LocalDateTime currentTime);
	
	// For the Doctor's Portal (shows all active records they are allowed to view right now)
	List<AccessGrant> findByViewerAddressIgnoreCaseAndExpiresAtAfter(String viewerAddress, LocalDateTime currentTime);
	
	// Change this specific method from Optional<AccessGrant> to List<AccessGrant>
	List<AccessGrant> findByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordId(
			String patientAddress, String viewerAddress, Long recordId);
	
	// Fetch active grants for a SPECIFIC patient and doctor combination
	List<AccessGrant> findByViewerAddressIgnoreCaseAndPatientAddressIgnoreCaseAndExpiresAtAfter(
			String viewerAddress, String patientAddress, LocalDateTime currentTime);
}
