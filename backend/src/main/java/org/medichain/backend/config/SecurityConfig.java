package org.medichain.backend.config;

import org.medichain.backend.security.JwtAuthEntryPoint;
import org.medichain.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
	private final JwtAuthFilter jwtAuthFilter;
	private final JwtAuthEntryPoint authEntryPoint;
	
	public SecurityConfig(JwtAuthFilter jwtAuthFilter, JwtAuthEntryPoint authEntryPoint) {
		this.jwtAuthFilter = jwtAuthFilter;
		this.authEntryPoint = authEntryPoint;
	}
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable())
				.exceptionHandling(exception -> exception.authenticationEntryPoint(authEntryPoint))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						// Allow anyone to request a nonce and login
						.requestMatchers("/api/v1/auth/**").permitAll()
						// Protect all blockchain and user data endpoints!
						.requestMatchers("/api/v1/blockchain/**", "/api/v1/users/**").authenticated()
						.anyRequest().permitAll()
				)
				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
		
		return http.build();
	}
}
