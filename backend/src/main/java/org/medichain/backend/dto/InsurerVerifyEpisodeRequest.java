package org.medichain.backend.dto;

import lombok.Data;

@Data
public class InsurerVerifyEpisodeRequest {
	private String insurerAddress;
	private String patientAddress;
	private Long episodeId;
}
