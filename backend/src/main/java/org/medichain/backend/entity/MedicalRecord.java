package org.medichain.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "medical_records")
@Data
public class MedicalRecord {
	
	@Id
	@Column(name = "record_id", nullable = false)
	private Long recordId; // This MUST match the Token ID from the Polygon Blockchain!
	
	@Column(name = "patient_address", nullable = false, length = 42)
	private String patientAddress;
	
	@Column(name = "doctor_address", nullable = false, length = 42)
	private String doctorAddress;
	
	@Column(name = "ipfs_cid", nullable = false)
	private String ipfsCid;
	
	@Column(name = "record_type")
	private String recordType; // e.g., "MRI", "Prescription", "Blood Test"
	
	@Column(name = "is_superseded", nullable = false)
	private boolean isSuperseded = false;
	
	@Column(name = "previous_record_id")
	private Long previousRecordId; // 0 or null if it's the original record
	
	@Column(name = "tx_hash", nullable = false)
	private String txHash; // To prove to the user that it's actually on the blockchain
}
