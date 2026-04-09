package org.medichain.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.medichain.backend.service.AuthService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
	
	private final AuthService authService;
	
	// Inject AuthService into the filter
	public JwtAuthFilter(AuthService authService) {
		this.authService = authService;
	}
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		
		String authHeader = request.getHeader("Authorization");
		
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}
		
		try {
			String token = authHeader.substring(7); // Remove "Bearer "
			
			Claims claims = Jwts.parserBuilder()
					.setSigningKey(authService.getSigningKey())
					.build()
					.parseClaimsJws(token)
					.getBody();
			
			String walletAddress = claims.getSubject();
			String role = claims.get("role", String.class);
			
			UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
					walletAddress,
					null,
					Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
			);
			
			SecurityContextHolder.getContext().setAuthentication(authToken);
			
		} catch (io.jsonwebtoken.ExpiredJwtException e) {
			SecurityContextHolder.clearContext();
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType("application/json");
			response.getWriter().write("{ \"success\": false, \"message\": \"Token expired\", \"code\": \"AUTH_001\" }");
			response.getWriter().flush();
			return;
		} catch (Exception e) {
			SecurityContextHolder.clearContext();
		}
		
		filterChain.doFilter(request, response);
	}
}
