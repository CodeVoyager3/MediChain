package org.medichain.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class GrantAccessRequest {
	private String doctorAddress;
	private List<Long> recordIds;
	private Long durationInSeconds;
}
