package com.photosapp.security.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Parametros de configuracion del JWT (application.yml -> app.security.jwt).
 *
 * @param secret           clave de firma (HS256, minimo 32 caracteres)
 * @param expirationMinutes duracion de la validez del token en minutos
 */
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(String secret, long expirationMinutes) {

	public JwtProperties {
		if (secret == null || secret.length() < 32) {
			throw new IllegalStateException(
					"app.security.jwt.secret debe tener al menos 32 caracteres");
		}
		if (expirationMinutes <= 0) {
			throw new IllegalStateException(
					"app.security.jwt.expiration-minutes debe ser mayor que 0");
		}
	}

}
