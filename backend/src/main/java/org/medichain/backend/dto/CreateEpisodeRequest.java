package org.medichain.backend.dto;

import lombok.Data;

@Data
public class CreateEpisodeRequest {
	private String patientAddress;
	private String title;
	private String description; // optional
}
