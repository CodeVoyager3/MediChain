package org.medichain.backend.dto;

import lombok.Data;

@Data
public class AuthNonceRequest {
	private String walletAddress;
}
