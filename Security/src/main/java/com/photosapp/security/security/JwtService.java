package com.photosapp.security.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import com.photosapp.security.config.JwtProperties;

/**
 * Genera y valida los tokens JWT (HS256).
 */
@Service
public class JwtService {

	private static final String CLAIM_ROLES = "roles";

	private final SecretKey signingKey;
	private final long expirationSeconds;

	public JwtService(JwtProperties jwtProperties) {
		this.signingKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
		this.expirationSeconds = jwtProperties.expirationMinutes() * 60;
	}

	/** Crea un token para el usuario indicado. */
	public String generateToken(UserDetails user) {
		Instant now = Instant.now();
		List<String> roles = user.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.toList();

		return Jwts.builder()
				.subject(user.getUsername())
				.claim(CLAIM_ROLES, roles)
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plusSeconds(expirationSeconds)))
				.signWith(signingKey)
				.compact();
	}

	/** Extrae el nombre de usuario del token, o null si es invalido. */
	public String extractUsername(String token) {
		try {
			Claims claims = parseClaims(token);
			return claims.getSubject();
		} catch (RuntimeException exception) {
			return null;
		}
	}

	/** Comprueba la firma y la fecha de expiracion. */
	public boolean isValid(String token, UserDetails user) {
		try {
			Claims claims = parseClaims(token);
			return user.getUsername().equals(claims.getSubject())
					&& claims.getExpiration().after(new Date());
		} catch (RuntimeException exception) {
			return false;
		}
	}

	/** Devuelve los roles guardados en el token. */
	@SuppressWarnings("unchecked")
	public List<String> extractRoles(String token) {
		Claims claims = parseClaims(token);
		Object roles = claims.get(CLAIM_ROLES);
		return roles instanceof List<?> list ? (List<String>) list : List.of();
	}

	private Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(signingKey)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

}
