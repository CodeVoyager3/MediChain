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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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
	
	public List<MedicalRecord> getPatientVault(String patientWallet) {
		return medicalRecordRepository.findByPatientAddressIgnoreCase(patientWallet);
	}
	
	@Transactional
	public void checkInToClinic(String patientWallet, String doctorAddress) {
		ClinicCheckIn checkIn = new ClinicCheckIn();
		checkIn.setPatientAddress(patientWallet);
		checkIn.setDoctorAddress(doctorAddress);
		checkIn.setStatus("WAITING");
		checkInRepository.save(checkIn);
	}
	
	public List<ClinicCheckIn> getWaitingRoom(String doctorWallet) {
		return checkInRepository.findByDoctorAddressIgnoreCaseAndStatusOrderByCheckInTimeDesc(doctorWallet, "WAITING");
	}
	
	public ClinicCheckIn getPatientActiveCheckIn(String patientWallet) {
		List<ClinicCheckIn> checkIns = checkInRepository.findByPatientAddressIgnoreCaseAndStatus(patientWallet, "WAITING");
		return checkIns.isEmpty() ? null : checkIns.get(0);
	}
	
	// THE FIX: Explicitly flags records as isGranted and/or isAuthored
	public List<Map<String, Object>> getAccessibleRecordsForPatient(String doctorWallet, String patientAddress) {
		List<AccessGrant> grants = accessGrantRepository.findByViewerAddressIgnoreCaseAndPatientAddressIgnoreCaseAndExpiresAtAfter(
				doctorWallet, patientAddress, LocalDateTime.now()
		);
		
		List<MedicalRecord> authoredRecords = medicalRecordRepository.findByDoctorAddressIgnoreCaseAndPatientAddressIgnoreCase(
				doctorWallet, patientAddress
		);
		
		Map<Long, Map<String, Object>> recordMap = new HashMap<>();
		
		// 1. Process Records the Patient explicitly GRANTED
		for (AccessGrant grant : grants) {
			medicalRecordRepository.findById(grant.getRecordId()).ifPresent(record -> {
				Map<String, Object> enriched = new HashMap<>();
				enriched.put("id", grant.getId());
				enriched.put("recordId", grant.getRecordId());
				enriched.put("patientAddress", grant.getPatientAddress());
				enriched.put("doctorAddress", grant.getViewerAddress());
				enriched.put("expiresAt", grant.getExpiresAt());
				enriched.put("ipfs_cid", record.getIpfsCid());
				enriched.put("recordType", record.getRecordType());
				enriched.put("superseded", record.isSuperseded());
				
				// Core Context Flags
				enriched.put("isGranted", true);
				enriched.put("isAuthored", record.getDoctorAddress().equalsIgnoreCase(doctorWallet));
				
				recordMap.put(record.getRecordId(), enriched);
			});
		}
		
		// 2. Process Records the Doctor AUTHORED (but hasn't been granted access to)
		for (MedicalRecord record : authoredRecords) {
			if (!recordMap.containsKey(record.getRecordId())) {
				Map<String, Object> enriched = new HashMap<>();
				enriched.put("id", "authored-" + record.getRecordId());
				enriched.put("recordId", record.getRecordId());
				enriched.put("patientAddress", record.getPatientAddress());
				enriched.put("doctorAddress", doctorWallet);
				enriched.put("expiresAt", null);
				enriched.put("ipfs_cid", record.getIpfsCid()); // Passed down, but frontend will block view
				enriched.put("recordType", record.getRecordType());
				enriched.put("superseded", record.isSuperseded());
				
				// Core Context Flags
				enriched.put("isGranted", false);
				enriched.put("isAuthored", true);
				
				recordMap.put(record.getRecordId(), enriched);
			}
		}
		
		return new ArrayList<>(recordMap.values());
	}
	
	@Transactional
	public void completeAppointment(String doctorWallet, Long checkInId) {
		ClinicCheckIn checkIn = checkInRepository.findByIdAndDoctorAddressIgnoreCase(checkInId, doctorWallet)
				.orElseThrow(() -> new RuntimeException("Check-in record not found or unauthorized."));
		checkIn.setStatus("COMPLETED");
		checkInRepository.save(checkIn);
	}
	
	@Transactional
	public void leaveWaitingRoom(String patientWallet) {
		List<ClinicCheckIn> checkIns = checkInRepository.findByPatientAddressIgnoreCaseAndStatus(patientWallet, "WAITING");
		for (ClinicCheckIn checkIn : checkIns) {
			checkIn.setStatus("LEFT"); // Marks them as gone so they disappear from Doctor's UI
			checkInRepository.save(checkIn);
		}
	}
}
