package org.medichain.backend.dto;

import lombok.Data;

@Data
public class RevokeAccessRequest {
	private String doctorAddress;
	private Long recordId;
}
