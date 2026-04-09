package org.medichain.backend.dto;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public final class ApiResponse {
	private ApiResponse() {}

	public static Map<String, Object> success(Object data) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("status", "success");
		body.put("data", data);
		body.put("timestamp", Instant.now().toString());
		return body;
	}

	public static Map<String, Object> success(String message, Object data) {
		Map<String, Object> body = success(data);
		body.put("message", message);
		return body;
	}

	public static Map<String, Object> error(String errorCode, String message) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("status", "error");
		body.put("errorCode", errorCode);
		body.put("message", message);
		body.put("timestamp", Instant.now().toString());
		return body;
	}
}
