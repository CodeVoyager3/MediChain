package org.medichain.backend.dto;

import lombok.Data;

@Data
public class CheckAccessRequest {
	private String patientAddress;
	private String doctorAddress;
	private Long recordId;
}
