package com.photosapp.security.config;

import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Usuarios de ejemplo cargados en memoria (application.yml -> app.security.users).
 * En la practica esto se sustituye por una tabla de usuarios en base de datos.
 */
@ConfigurationProperties(prefix = "app.security")
public record SecurityUsersProperties(Map<String, UserAccount> users) {

	/**
	 * @param password contrasena en texto plano (se codifica al arrancar)
	 * @param roles    roles asignados, por ejemplo USER o ADMIN
	 */
	public record UserAccount(String password, List<String> roles) {
	}

}
