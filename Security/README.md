# Security - Java 21 + Spring Boot + Spring Security

Microservicio de autenticacion y autorizacion. Emite tokens JWT (HS256) y valida
los que llegan en el header `Authorization: Bearer <token>`.

## Puesta en marcha

```bash
./mvnw spring-boot:run     # o bien: mvn spring-boot:run
```

Queda en <http://localhost:8080>. Documentacion: <http://localhost:8080/swagger-ui>
(solo si anades springdoc) y actuator en `/actuator/health`.

## Probar el login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

Respuesta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "roles": ["ROLE_ADMIN", "ROLE_USER"]
}
```

Con ese token se puede llamar a un endpoint protegido:

```bash
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer <token>"
```

## Endpoints

| Metodo | Ruta              | Acceso    | Descripcion                 |
| ------ | ----------------- | --------- | --------------------------- |
| POST   | `/api/auth/login` | publico   | Devuelve token, usuario y roles |
| GET    | `/api/auth/me`    | con token | Datos del usuario autenticado |
| GET    | `/actuator/health`| publico   | Estado del servicio          |

Cualquier otra ruta exige `Authorization: Bearer <token>`.

## Estructura

```
src/main/java/com/photosapp/security/
  SecurityServiceApplication.java  Punto de entrada (@ConfigurationPropertiesScan)
  config/
    SecurityConfig.java            Cadena de filtros, BCrypt, usuarios en memoria
    JwtProperties.java             app.security.jwt.*
    SecurityUsersProperties.java   app.security.users.*
  security/
    JwtService.java                Genera y valida tokens
    JwtAuthenticationFilter.java   Lee el header Authorization
  controller/AuthController.java   Endpoints de login y /me
  dto/                             LoginRequest, LoginResponse
```

## Configuracion

Todo esta en `src/main/resources/application.yml`:

```yaml
app:
  security:
    jwt:
      secret: ${JWT_SECRET:...}   # minimo 32 caracteres
      expiration-minutes: 60
    users:                        # usuarios de ejemplo
      admin:
        password: admin123
        roles: [ADMIN, USER]
```

En produccion define `JWT_SECRET` como variable de entorno y no uses los usuarios
del YAML: lo normal es una entidad `AppUser` con JPA y passwords con BCrypt.

## Base de datos

De momento se usa H2 en memoria (`jdbc:h2:mem:securitydb`) para que arranque sin
configuracion. Para MySQL o PostgreSQL, cambia el bloque `spring.datasource` y anade
el driver.
