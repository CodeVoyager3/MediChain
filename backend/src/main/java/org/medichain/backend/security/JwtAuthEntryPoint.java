package org.medichain.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.medichain.backend.dto.ApiResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
		response.setContentType("application/json");
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Returns 401 instead of 403
		response.getWriter().write(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(
				ApiResponse.error("UNAUTHORIZED", "Unauthorized. A valid JWT token is required.")
		));
	}
}
