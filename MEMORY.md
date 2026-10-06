## BackEnd

- Usa Express 4 y TypeORM; los controladores async deben registrarse con `asyncHandler` y los errores de negocio deben usar `AppError`.
- La funcionalidad de likes sigue sin implementarse: no hay entidad TypeORM funcional, migracion registrada ni rutas. `entities/like.ts` contiene actualmente un hook de React, lo que rompe el typecheck del BackEnd. `like.controller.ts` debe indicar `501` hasta que se implemente el soporte; no usar Prisma en este servicio.