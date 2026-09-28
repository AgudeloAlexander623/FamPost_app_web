package com.photosapp.security.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Datos que llegan en POST /api/auth/login.
 */
public record LoginRequest(
		@NotBlank(message = "El usuario es obligatorio") String username,
		@NotBlank(message = "La contrasena es obligatoria") String password) {
}
