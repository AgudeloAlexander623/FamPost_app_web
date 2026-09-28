package com.photosapp.security.dto;

import java.util.List;

/**
 * Respuesta de login: el token y los datos del usuario.
 */
public record LoginResponse(String token, String username, List<String> roles) {
}
