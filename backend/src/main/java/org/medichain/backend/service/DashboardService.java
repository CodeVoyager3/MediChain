package org.medichain.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.entity.AccessGrant;
import org.medichain.backend.entity.ClinicCheckIn;
import org.medichain.backend.entity.MedicalRecord;
import org.medichain.backend.repository.AccessGrantRepository;
import org.medichain.backend.repository.CheckInRepository;
import org.medichain.backend.repository.MedicalRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class DashboardService {
	
	private final MedicalRecordRepository medicalRecordRepository;
	private final AccessGrantRepository accessGrantRepository;
	private final CheckInRepository checkInRepository;
	
	public DashboardService(MedicalRecordRepository medicalRecordRepository,
			AccessGrantRepository accessGrantRepository,
			CheckInRepository checkInRepository) {
		this.medicalRecordRepository = medicalRecordRepository;
		this.accessGrantRepository = accessGrantRepository;
		this.checkInRepository = checkInRepository;
	}
	
	// --- PATIENT LOGIC ---
	
	public List<MedicalRecord> getPatientVault(String patientWallet) {
		log.info("Fetching vault for patient: {}", patientWallet);
		return medicalRecordRepository.findByPatientAddressIgnoreCase(patientWallet);
	}
	
	@Transactional
	public void checkInToClinic(String patientWallet, String doctorAddress) {
		log.info("Patient {} checking in to Doctor {}'s clinic", patientWallet, doctorAddress);
		ClinicCheckIn checkIn = new ClinicCheckIn();
		checkIn.setPatientAddress(patientWallet);
		checkIn.setDoctorAddress(doctorAddress);
		checkIn.setStatus("WAITING");
		checkInRepository.save(checkIn);
	}
	
	// --- DOCTOR LOGIC ---
	
	public List<ClinicCheckIn> getWaitingRoom(String doctorWallet) {
		log.info("Fetching waiting room for Doctor: {}", doctorWallet);
		return checkInRepository.findByDoctorAddressIgnoreCaseAndStatusOrderByCheckInTimeDesc(doctorWallet, "WAITING");
	}
	
	public List<AccessGrant> getAccessibleRecordsForPatient(String doctorWallet, String patientAddress) {
		log.info("Doctor {} requesting accessible records for Patient {}", doctorWallet, patientAddress);
		return accessGrantRepository.findByViewerAddressIgnoreCaseAndPatientAddressIgnoreCaseAndExpiresAtAfter(
				doctorWallet, patientAddress, LocalDateTime.now()
		);
	}
	
	@Transactional
	public void completeAppointment(String doctorWallet, Long checkInId) {
		log.info("Doctor {} completing appointment ID: {}", doctorWallet, checkInId);
		
		ClinicCheckIn checkIn = checkInRepository.findByIdAndDoctorAddressIgnoreCase(checkInId, doctorWallet)
				.orElseThrow(() -> new RuntimeException("Check-in record not found or unauthorized."));
		
		checkIn.setStatus("COMPLETED");
		checkInRepository.save(checkIn);
	}
}
