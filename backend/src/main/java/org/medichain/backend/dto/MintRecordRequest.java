package org.medichain.backend.dto;

import lombok.Data;

@Data
public class MintRecordRequest {
	private String patientAddress;
	private String cid; // The IPFS hash of the medical file
	private Long previousRecordId; // If amending, the record ID being superseded (null for new records)
	private String recordType;
	private Long episodeId; // Optional: link to an episode
}
