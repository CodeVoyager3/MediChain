package org.medichain.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "clinic_checkins")
@Data
public class ClinicCheckIn {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "patient_address", nullable = false)
	private String patientAddress;
	
	@Column(name = "doctor_address", nullable = false)
	private String doctorAddress;
	
	@Column(name = "check_in_time", nullable = false)
	private LocalDateTime checkInTime = LocalDateTime.now();
	
	// So the doctor can clear them from the waiting room after the appointment
	@Column(name = "status")
	private String status = "WAITING";
}
