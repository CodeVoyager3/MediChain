package org.medichain.backend.dto;

import lombok.Data;

@Data
public class InsurerViewRequest {
	private String insurerAddress;
	private String patientAddress;
	private Long recordId;
}
