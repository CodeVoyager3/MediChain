package org.medichain.backend.dto;

import lombok.Data;

@Data
public class MintRecordRequest {
	private String patientAddress;
	private String cid; // The IPFS hash of the medical file
}
