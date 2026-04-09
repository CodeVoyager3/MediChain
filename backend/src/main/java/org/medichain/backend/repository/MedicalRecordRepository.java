package org.medichain.backend.repository;

import org.medichain.backend.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
	// Fetches the entire vault for a specific patient (unordered)
	List<MedicalRecord> findByPatientAddressIgnoreCase(String patientAddress);
	
	// Fetches vault ordered by creation date (newest first) — spec Section 3.2
	List<MedicalRecord> findByPatientAddressIgnoreCaseOrderByCreatedAtDesc(String patientAddress);
	
	// Fetch all records issued by a specific doctor
	List<MedicalRecord> findByDoctorAddressIgnoreCase(String doctorAddress);
	
	List<MedicalRecord> findByDoctorAddressIgnoreCaseAndPatientAddressIgnoreCase(String doctorAddress, String patientAddress);

	List<MedicalRecord> findByPatientAddressIgnoreCaseAndEpisodeIdOrderByRecordIdDesc(String patientAddress, Long episodeId);
}
