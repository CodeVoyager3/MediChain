package org.medichain.backend.dto;

import lombok.Data;

@Data
public class AuthVerifyRequest {
	private String walletAddress;
	private String signature;
}
