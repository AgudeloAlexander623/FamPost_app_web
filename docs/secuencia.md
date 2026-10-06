# Diagramas de secuencia - Photos APP

Los diagramas de secuencia muestran **el orden** de los mensajes: quién llama a
quién, en qué momento, y qué se devuelve. Es la vista que responde a la pregunta
"¿qué pasa cuando...?".

Código fuente en `docs/diagramas/secuencia/`. Los bloques de este documento se
generan con `docs/sync-diagramas.ps1`.

## Convenciones

| Convención | Significado |
| ---------- | ----------- |
| `autonumber` | Cada mensaje lleva su número. Al leerlo hay que seguir el orden, no las líneas de Life Line |
| `activate` / `deactivate` | Marca qué objeto está ejecutándose. Se usa solo en las fronteras del sistema, no en cada mensaje |
| `alt` | Camino alternativo: el primero es "se cumple" y los siguientes son las condiciones distintas |
| `opt` | Mensaje opcional |
| `loop` | Repetición |
| `group` | Agrupa mensajes que pertenecen a un mismo caso de uso, sin cambiar el flujo |
| `-->` frente a `->` | Diferencia entre una respuesta y una llamada nueva: la respuesta no gasta un turno del actor |
| Sin tildes en el `.puml` | Evita fallos de codificación en el renderizador público. En este `.md` sí se usan |

> PlantUML **no admite `else` dentro de `group`**: para un camino alternativo hay
> que usar `alt`, que sí se puede anidar dentro de `group`.

## Qué dibujan y qué no

Estos ocho diagramas **describen el comportamiento que exigen los casos de uso**,
no lo que el código hace hoy. La diferencia es real y no es un descuido:

| Diagrama | Estado en el código |
| -------- | ------------------- |
| 1 · Iniciar sesión | **Funciona.** `BackEnd` → `Security` → token |
| 2 · Registrarse con invitación | No implementado |
| 3 · Emitir invitación | No implementado |
| 4 · Crear publicación con fotografía | Parcial: la fotografía sí (`/api/photos`), la publicación no |
| 5 · Consultar el feed | No implementado |
| 6 · Comentar una publicación | No implementado |
| 7 · Reaccionar a una publicación | No implementado |
| 8 · Recuperar y restablecer contraseña | No implementado |

Cada diagrama lleva una nota al pie con su estado. Se marcaron porque un diagrama
de requisitos que se presenta como descripción del sistema sin decirlo lleva a
creer que ya funciona.

**El caso más importante es el 1:** el `BackEnd` **no valida el JWT**. No hay
middleware de autenticación; `GET /api/photos` responde igual con y sin cabecera
`Authorization`, y la variable `JWT_SECRET` existe en el `.env` pero no se usa en
ningún sitio. El diagrama 1 muestra la sesión activa como dato que ya existe; en
cuanto se escriba el middleware, el primer mensaje de los diagramas 2 a 8 será
validar ese token.

## Por qué ocho diagramas

Uno por flujo que un usuario puede iniciar y que tiene un resultado observable
distinto. No hay un diagrama por cada uno de los 47 casos de uso porque:

- Los casos de uso de **consulta** (UC04, UC21, UC29, UC30, UC32, UC33…) son un
  mensaje y una respuesta. Dibujarlos sería hacer 12 diagramas de dos flechas.
- Los casos de uso de **edición** (UC10, UC19, UC25) son el mismo diagrama con
  otro objeto: la diferencia no es estructural, y un diagrama por cada uno solo
  cambiaría el nombre de la clase.
- Un caso de uso por botón, que es el error típico aquí, no aporta nada: el botón
  no es un mensaje, es el momento en que el actor decide enviarlo.

Los ocho cubren los tres actores (Usuario, Administrador) y las cuatro
fronteras del sistema (interfaz, `BackEnd`, `Security`, base de datos).

---

# Diagrama 1 — Iniciar sesión (UC02 con «include» UC08)

El único «include» del sistema, y el único flujo que hoy funciona de verdad.
Se ve por qué `Autenticar usuario` es un caso de uso aparte: lo ejecuta
`Security`, un actor externo, no el `BackEnd`.

```plantuml
@startuml
title Diagrama de secuencia 1 - Iniciar sesion (UC02, con «include» UC08)

skinparam shadowing false
autonumber

actor Usuario
boundary "LoginPage\n(FrontEnd)" as UI
control "AuthController\n(BackEnd)" as AC
control "SecurityService\n(BackEnd)" as SS
participant "Security\n(servicio Java)" as SEC

activate UI
Usuario -> UI : introduce usuario y contrasena
UI -> AC : POST /api/auth/login
activate AC
AC -> SS : login(usuario, contrasena)
activate SS

group UC08 - Autenticar usuario
  SS -> SEC : POST /api/auth/login
  activate SEC
  alt las credenciales son validas
    SEC -> SEC : busca el usuario y compara la contrasena
    SEC --> SS : 200 { token, username, roles }
  else el usuario no existe o la clave no cuadra
    SEC --> SS : 401 credenciales invalidas
  else la cuenta esta desactivada o bloqueada
    SEC --> SS : 403 cuenta no habilitada
  end
  deactivate SEC
end

alt la sesion se inicia
  SS --> AC : token
  deactivate SS
  AC --> UI : 200 { token, username, roles }
  deactivate AC
  UI -> UI : guarda el token en localStorage
  UI --> Usuario : muestra la pantalla principal
else el acceso se rechaza
  SS --> AC : error de autenticacion
  deactivate SS
  AC --> UI : 401 o 403
  deactivate AC
  UI --> Usuario : "Credenciales invalidas\no servicio no disponible"
end
deactivate UI

note over SEC
  UC08 es el unico «include» de todo el
  modelo: se dibuja aparte porque autenticar
  tambien es objetivo del servicio de
  autenticacion, que actua por su cuenta al
  atender peticiones de otros clientes.
end note

note over SEC
  COMO ESTA HOY, NO COMO DEBERIA:
  el servicio valida contra los usuarios fijos
  de application.yml. Con el registro por
  invitacion (UC01) tienen que pasar a leerse
  de la base de datos.
end note

note over UI, AC
  Ni la interfaz ni el BackEnd validan el token:
  no hay ningun middleware que lo compruebe.
  Por eso este diagrama termina al devolver el
  token y no sigue hacia "Acceder al feed".
  Ese es el punto pendiente del modulo.
end note
@enduml
```

# Diagrama 2 — Registrarse con invitación (UC01)

```plantuml
@startuml
title Diagrama de secuencia 2 - Registrarse con invitacion (UC01)

skinparam shadowing false
autonumber

actor "Nuevo familiar" as U
boundary "RegisterPage\n(FrontEnd)" as UI
control "RegistroController\n(BackEnd)" as RC
control "InvitacionService\n(BackEnd)" as IS
control "UsuarioService\n(BackEnd)" as US
database "PostgreSQL" as DB

activate UI
U -> UI : abre el formulario de alta
U -> UI : introduce usuario, nombre,\ncontrasena y codigo de invitacion
UI -> RC : POST /api/registro
activate RC
RC -> IS : validarCodigo(codigo)
activate IS
IS -> DB : busca la invitacion por codigo
activate DB
DB --> IS : invitacion o ninguna
deactivate DB

alt el codigo no existe, ya se uso o esta caducado
  IS --> RC : codigo no valido
  deactivate IS
  RC --> UI : 400 "invitacion no valida"
  deactivate RC
  UI --> U : "pide un codigo nuevo al Administrador"
else el codigo es valido
  IS --> RC : invitacion valida
  deactivate IS
  RC -> US : crear(usuario, rol USUARIO)
  activate US
  US -> DB : insertar el usuario
  activate DB
  DB --> US : usuario creado
  deactivate DB
  US -> DB : marcar la invitacion como usada
  deactivate US
  RC --> UI : 201 cuenta creada
  deactivate RC
  UI --> U : "cuenta creada, ya puedes entrar"
end
deactivate UI

note over U, DB
  NO se crea sesion al registrarse. El Diagrama 1
  de casos de uso pone "no existe sesion activa"
  como precondicion de UC01, asi que despues hay
  que iniciar sesion por separado (UC02).
end note

note over U, DB
  El rol se fija siempre en USUARIO. El
  Administrador no se puede obtener por aqui:
  es una de las dos barreras que hacen que el
  registro sea privado.
end note

note over IS, DB
  La validacion del codigo NO es un caso de uso
  propio, es un paso interno de UC01: no tiene
  actor ni objetivo independiente. Por eso en
  los casos de uso aparece como precondicion y
  no como «include».
end note

note over RC
  COMO ESTA HOY: no implementado. El BackEnd solo
  tiene /auth/login. Este diagrama especifica el
  comportamiento que exigen los casos de uso.
end note
@enduml
```

# Diagrama 3 — Emitir invitación (UC47)

Va **antes** que el 2 en el orden del producto, no en el del documento: sin el
UC47 el UC01 no tiene entrada, y así se lee de arriba abajo la cadena
Administrador → invitación → registro.

```plantuml
@startuml
title Diagrama de secuencia 3 - Emitir invitacion (UC47)

skinparam shadowing false
autonumber

actor Administrador as AD
boundary "AdminPage\n(FrontEnd)" as UI
control "AdminController\n(BackEnd)" as AC
control "InvitacionService\n(BackEnd)" as IS
database "PostgreSQL" as DB
actor "Canal externo\n(WhatsApp, en persona)" as EXT

activate UI
AD -> UI : entra en administracion
AD -> UI : pulsa "Emitir invitacion"
UI -> AC : POST /api/admin/invitaciones
activate AC
AC -> IS : emitir()
activate IS

IS -> IS : genera un codigo unico
IS -> IS : calcula la fecha de caducidad
IS -> DB : guarda la invitacion
activate DB
DB --> IS : codigo creado
deactivate DB
IS --> AC : { codigo, fechaCaducidad }
deactivate IS

AC --> UI : 201 { codigo, fechaCaducidad }
deactivate AC
UI --> AD : muestra el codigo para comunicarlo
deactivate UI

AD -> EXT : comunica el codigo al familiar
EXT --> AD : el familiar lo recibe

note over AD, EXT
  El aviso es EXTERNO y manual: el sistema no
  envia correo ni mensaje. Por eso el Diagrama 6
  de casos de uso deja claro que la invitacion no
  genera notificacion, igual que el
  restablecimiento de contrasena.
end note

note over IS
  El codigo se caduca si no se usa. Si el
  Administrador pierde el codigo, emite otro:
  no hay forma de recuperar el anterior.
end note

note over AC
  COMO ESTA HOY: no implementado. Se anade aqui
  porque el registro por invitacion (UC01)
  depende de este caso de uso: sin el, el alta
  de usuarios no tendria entrada.
end note
@enduml
```

# Diagrama 4 — Crear publicación con fotografía (UC17, UC18, UC31)

El diagrama más denso, porque aquí caen las dos relaciones «extend» encadenadas:
adjuntar fotografía (UC18) que a su vez extiende con subir fotografía (UC31).

```plantuml
@startuml
title Diagrama de secuencia 4 - Crear publicacion con fotografia (UC17, UC18, UC31)

skinparam shadowing false
autonumber

actor Usuario as U
boundary "PublicacionPage\n(FrontEnd)" as UI
control "PublicacionController\n(BackEnd)" as PC
control "FotografiaService\n(BackEnd)" as FS
control "PublicacionService\n(BackEnd)" as PS
database "PostgreSQL" as DB

activate UI
U -> UI : escribe el texto
alt adjunta una foto que ya esta en su galeria
  U -> UI : elige una fotografia de su galeria (UC32)
else adjunta una foto nueva
  U -> UI : selecciona un archivo
  group UC31 - Subir fotografia
    UI -> FS : POST /api/fotografias
    activate FS
    FS -> DB : guarda la url de la foto
    activate DB
    DB --> FS : fotografia creada
    deactivate DB
    FS --> UI : 201 fotografia
    deactivate FS
  end
end

U -> UI : pulsa "Publicar"
UI -> PC : POST /api/publicaciones
activate PC

PC -> PS : crear(autor, texto, fotos)
activate PS

alt no hay texto ni ninguna foto
  PS --> PC : la publicacion no tiene contenido
  deactivate PS
  PC --> UI : 400 "escribe algo o adjunta una foto"
else hay texto o al menos una foto
  PS -> DB : inserta la publicacion
  activate DB
  DB --> PS : publicacion creada
  deactivate DB

  loop por cada fotografia adjunta
    group UC18 - Adjuntar fotografia a una publicacion
      PS -> DB : crea el vinculo publicacion-fotografia
    end
  end

  PS --> PC : 201 publicacion creada
  deactivate PS
  PC --> UI : 201 publicacion
end
deactivate PC
UI --> U : "publicacion visible en el feed"
deactivate UI

note over U, DB
  UC18 aparece dos veces en los casos de uso: como
  «extend» de UC17 aqui, y con su propio detalle
  en el Diagrama 5 para cuando se usa sobre una
  publicacion ya creada. Es el mismo caso de uso,
  no dos distintos.
end note

note over U, DB
  Publicar NO genera notificacion. El Diagrama 6
  solo foresee notificar comentarios, reacciones
  y seguidores nuevos: las publicaciones nuevas
  aparecen en el feed, que es su propio canal.
end note

note over FS, DB
  La fotografia se guarda en la galeria del
  propietario aunque luego se desvincule de la
  publicacion (UC35). Eliminar la publicacion no
  borra la foto.

  COMO ESTA HOY: el alta de fotos ya funciona
  (BackEnd -> PostgreSQL, tabla photos), pero la
  publicacion todavia no. El microservicio de
  fotos existe y esta levantandose, aunque el
  BackEnd no lo llama: no aparece en este
  diagrama porque ningun flujo lo usa todavia.
end note
@enduml
```

# Diagrama 5 — Consultar el feed (UC22)

```plantuml
@startuml
title Diagrama de secuencia 5 - Consultar el feed (UC22)

skinparam shadowing false
autonumber

actor Usuario as U
boundary "HomePage\n(FrontEnd)" as UI
control "FeedController\n(BackEnd)" as FC
control "FeedService\n(BackEnd)" as FS
control "SeguimientoService\n(BackEnd)" as SS
database "PostgreSQL" as DB

activate UI
U -> UI : entra en la aplicacion
UI -> FC : GET /api/publicaciones/feed
activate FC
FC -> FS : listarFeed(usuario)
activate FS

FS -> SS : siguiendoDe(usuario)
activate SS
SS -> DB : ids de los usuarios a los que sigue
activate DB
DB --> SS : lista de ids
deactivate DB
SS --> FS : ids
deactivate SS

FS -> DB : publicaciones de esos ids\nmas las del propio usuario,\nordenadas por fecha desc
activate DB
DB --> FS : publicaciones
deactivate DB

FS --> FC : publicaciones
deactivate FS
FC --> UI : 200 lista de publicaciones
deactivate FC

loop por cada publicacion
  UI -> UI : anade las reacciones y el numero\nde comentarios de cada una
end

UI --> U : muestra el feed
deactivate UI

note over FS, DB
  El seguimiento es UNIDIRECCIONAL, al estilo
  Twitter: el feed se monta con las cuentas que
  el usuario sigue, no con las que le siguen.
  Alguien puede publicar y no aparecer en el feed
  de quien le sigue de vuelta.
end note

note over U, DB
  La sesion activa es precondicion transversal
  de todos los diagramas 2 a 6. En los casos de
  uso no es un caso de uso, y aqui tampoco se
  dibuja como mensaje: en cuanto exista el
  middleware que valide el token, esta sera la
  primera comprobacion del diagrama.
end note

note over FS
  Lo que NO se hace, a proposito:
  - No se avisa a los seguidores de cada
    publicacion. Se enteran por el feed.
  - No se pagina. Los casos de uso no lo dicen, y
    anadirlo aqui seria decidir por el usuario.
  - No se filtran publicaciones de cuentas
    bloqueadas. La regla "bloqueado no ve
    publicaciones" (UC44) no se ha concretado en
    los casos de uso y hay que decidirla antes.
end note
@enduml
```

# Diagrama 6 — Comentar una publicación (UC24)

```plantuml
@startuml
title Diagrama de secuencia 6 - Comentar una publicacion (UC24)

skinparam shadowing false
autonumber

actor Usuario as U
boundary "PublicacionPage\n(FrontEnd)" as UI
control "ComentarioController\n(BackEnd)" as CC
control "ComentarioService\n(BackEnd)" as CS
control "NotificacionService\n(BackEnd)" as NS
database "PostgreSQL" as DB

activate UI
U -> UI : escribe el comentario
U -> UI : pulsa "Comentar"
UI -> CC : POST /api/publicaciones/{id}/comentarios
activate CC
CC -> CS : crear(autor, publicacion, texto)
activate CS

CS -> DB : comprueba que el autor\nsigue al dueno de la publicacion
activate DB
DB --> CS : es seguida
deactivate DB

alt el autor esta bloqueado
  CS --> CC : 403 usuario bloqueado
  deactivate CS
  CC --> UI : 403
  deactivate CC
  UI --> U : "no puedes comentar"
else el autor no sigue al dueno
  CS --> CC : 400 "solo puedes comentar a quien sigues"
  deactivate CS
  CC --> UI : 400
  deactivate CC
  UI --> U : "sigue a este familiar para comentar"
else se puede comentar
  CS -> DB : inserta el comentario
  activate DB
  DB --> CS : comentario creado
  deactivate DB
  CS --> CC : 201 comentario
  deactivate CS
  CC --> UI : 201 comentario
  deactivate CC
  UI --> U : "el comentario aparece en la lista"

  CS -> NS : crear(dueno, NUEVO_COMENTARIO, comentario)
  activate NS
  NS -> DB : guarda la notificacion
  activate DB
  DB --> NS : notificacion creada
  deactivate DB
  NS --> UI : "el dueno la vera en su bandeja"
  deactivate NS
end
deactivate UI

note over CS, NS
  La notificacion NO se dibuja como «include» en
  los casos de uso, y aqui tampoco va con flecha
  de retorno: es una reaccion del sistema ante
  otro actor (el dueno), no un subobjetivo de
  comentar. Se lanza despues, y aunque falle, el
  comentario ya esta guardado.
end note

note over NS
  Si el comentario se borra (UC26), la
  notificacion asociada se borra con el: no
  puede quedar apuntando a algo que ya no existe.
end note

note over CC
  COMO ESTA HOY: no implementado. El BackEnd solo
  tiene /health, /auth/login y /photos. Este
  diagrama especifica el comportamiento que exigen
  los casos de uso.
end note
@enduml
```

# Diagrama 7 — Reaccionar a una publicación (UC27)

```plantuml
@startuml
title Diagrama de secuencia 7 - Reaccionar a una publicacion (UC27)

skinparam shadowing false
autonumber

actor Usuario as U
boundary "PublicacionPage\n(FrontEnd)" as UI
control "ReaccionController\n(BackEnd)" as RC
control "ReaccionService\n(BackEnd)" as RS
control "NotificacionService\n(BackEnd)" as NS
database "PostgreSQL" as DB

activate UI
U -> UI : elige una reaccion\n(corazon, me gusta, risa)
UI -> RC : POST /api/publicaciones/{id}/reacciones
activate RC
RC -> RS : registrar(usuario, publicacion, tipo)
activate RS

RS -> DB : busca la reaccion de ese usuario\na esa publicacion
activate DB
DB --> RS : reaccion existente o ninguna
deactivate DB

alt el usuario ya habia reaccionado
  RS -> DB : actualiza el tipo de reaccion
  deactivate DB
  RS --> RC : 200 reaccion actualizada
else es la primera reaccion
  RS -> DB : inserta la reaccion
  deactivate DB
  RS --> RC : 201 reaccion creada
end

RC --> UI : la reaccion aparece en la publicacion
deactivate RC

alt es su propia publicacion
  RS -> NS : no crear notificacion
  note right of NS
    Decision pendiente: los casos de uso no dicen
    si uno recibe aviso de su propia reaccion.
    Aqui se asume que no, porque el autor ya ve
    su publicacion.
  end note
else es la publicacion de otro
  RS -> NS : crear(dueno, NUEVA_REACCION, publicacion)
  activate NS
  NS -> DB : guarda la notificacion
  activate DB
  DB --> NS : notificacion creada
  deactivate DB
  NS --> UI : "el dueno la vera en su bandeja"
  deactivate NS
end
deactivate RS
deactivate UI

note over RS, DB
  Un usuario deja como mucho una reaccion por
  publicacion. Por eso "cambiar de reaccion"
  actualiza la fila existente en vez de crear
  otra: si no, al elegir dos veces le aparecerian
  dos reacciones al mismo usuario.
end note

note over U, DB
  PENDIENTE DE DECIDIR: los casos de uso cubren
  "reaccionar" y "quitar reaccion", pero NO
  cubren cambiar de tipo. Se asume que la misma
  accion sirve para cambiar, porque es lo que
  hace la mayoria de las redes. Si prefieres que
  el cambio sea un caso de uso aparte, habria que
  anadirlo.
end note
@enduml
```

# Diagrama 8 — Recuperar y restablecer la contraseña (UC06 y UC45)

Dos fases en un diagrama porque la dependencia entre ellas es justo lo que
interesa documentar: la primera la pide el Usuario, la segunda la resuelve el
Administrador, y **ninguna de las dos genera notificación**.

```plantuml
@startuml
title Diagrama de secuencia 8 - Recuperar y restablecer la contrasena (UC06 y UC45)

skinparam shadowing false
autonumber

actor Usuario as U
actor Administrador as AD
boundary "LoginPage\ny RecuperarPage" as UI
control "AuthController\n(BackEnd)" as AC
control "UsuarioService\n(BackEnd)" as US
control "AdminController\n(BackEnd)" as ADC
control "PasswordService\n(BackEnd)" as PS
database "PostgreSQL" as DB
actor "Canal externo\n(WhatsApp, en persona)" as EXT

== FASE 1 - El usuario pide el restablecimiento ==

activate UI
U -> UI : pulsa "He olvidado mi contrasena"
U -> UI : escribe su nombre de usuario
UI -> AC : POST /api/auth/recuperar
activate AC
AC -> US : marcarPendienteRestablecimiento(usuario)
activate US
US -> DB : pone la cuenta en estado pendiente
activate DB
DB --> US : cuenta actualizada
deactivate DB
US --> AC : ok
deactivate US
AC --> UI : 200 "pide al Administrador"
deactivate UI
UI --> U : "tu cuenta queda a la espera"

note over U, DB
  El usuario NO recibe ninguna notificacion. El
  Diagrama 6 de casos de uso lo deja explicito:
  el aviso lo da el Administrador por un canal
  externo. Por eso el unico mensaje de este
  diagrama es el de la interfaz.
end note

== FASE 2 - El Administrador restablece la contrasena ==

activate ADC
AD -> ADC : entra en administracion
AD -> ADC : consulta las cuentas pendientes (UC42)
ADC -> DB : busca cuentas con estado pendiente
activate DB
DB --> ADC : listado de cuentas
deactivate DB
ADC --> AD : muestra la cuenta pendiente
deactivate ADC

AD -> AD : elige la cuenta
activate PS
AD -> PS : restablecer(usuario, nuevaClave)
PS -> DB : guarda la contrasena cifrada
activate DB
DB --> PS : cuenta actualizada
deactivate DB
PS -> DB : la cuenta deja de estar pendiente
deactivate DB
PS --> EXT : ninguna llamada: no hay envio de correo
deactivate PS

AD -> EXT : comunica la nueva contrasena al usuario
EXT --> AD : el usuario la recibe

note over AD, EXT
  Esta fase la ejecuta el Administrador, no el
  sistema. No es un «include» de la fase 1: es
  otro actor y otro caso de uso (UC45), en otro
  diagrama. La dependencia entre ambos se
  documenta como precondicion, no como relacion
  «include».
end note

note over PS
  La contrasena se guarda cifrada, nunca en
  claro. El hash lo lleva el servicio de
  autenticacion: el BackEnd no compara contrasenas,
  se las pasa.
end note

note over AC
  COMO ESTA HOY: no implementado. Ademas, Security
  valida contra los usuarios fijos de
  application.yml, asi que hasta que los usuarios
  no vivan en PostgreSQL este flujo no puede
  funcionar tal cual.
end note
@enduml
```

---

## Cobertura: caso de uso → diagrama

| Diagrama | Casos de uso | Relaciones que se ven |
| -------- | ------------ | ---------------------- |
| 1 · Iniciar sesión | UC02, UC08 | R1 «include» |
| 2 · Registrarse | UC01 | R11 (precondición del código) |
| 3 · Emitir invitación | UC47 | — |
| 4 · Crear publicación | UC17, UC18, UC31 | R5 y R6 «extend» |
| 5 · Consultar feed | UC22 | — |
| 6 · Comentar | UC24 | R8 «trace» a UC37 |
| 7 · Reaccionar | UC27 | R8 «trace» a UC37 |
| 8 · Recuperar contraseña | UC06, UC45, UC42 | R10 «trace» |

**Casos de uso sin diagrama de secuencia, y por qué:**

| Casos de uso | Por qué no tienen uno |
| ------------- | -------------------- |
| UC03, UC04, UC05, UC07, UC15, UC41, UC46 | Un mensaje y una respuesta sobre una clase ya dibujada |
| UC09, UC10, UC11, UC12, UC13, UC14, UC16 | Lectura o edición simple sobre `Usuario` y `Seguimiento` |
| UC19, UC20, UC21, UC23, UC25, UC26, UC28, UC29, UC30 | Igual, sobre `Publicacion`, `Comentario` y `Reaccion` |
| UC32, UC33, UC34, UC35, UC36 | Igual, sobre `Fotografia` |
| UC39, UC40 | Cambian un estado de `Notificacion`, ya visible en el diagrama 4 de comunicación |
| UC42, UC43, UC44 | Administración de cuentas: son cambios de un booleano, visibles en el diagrama 1 de clases |

Si alguno de ellos necesitara un diagrama propio, la regla sería que el flujo
cruza **más de una frontera del sistema** (navegador → `BackEnd` → base de datos
→ `Security`). Ninguno de los de la tabla llega a eso.

## Qué se ha dejado fuera a propósito

| No aparece | Motivo |
| ---------- | ------ |
| Validación de campos, comprobaciones de formato | No son mensajes entre objetos: son detalles internos de un paso. En los casos de uso ya se excluyen (§1.7 de `casos-de-uso.md`) |
| CORS | En desarrollo lo resuelve el proxy de Vite; en producción sería del proxy inverso. Es configuración, no comportamiento |
| Manejo de errores y reintentos | El diagrama marca el camino de error de cada caso (el `alt`), que es lo que el usuario ve. Los reintentos y el *logging* no son requisitos |
| Miniaturas y compresión de imágenes | UC31 dice que se comprueban formato y tamaño, pero no dice que se genere miniatura. Añadirlo sería inventar |
| Envío de correo o push | No hay servicio de correo. El aviso de invitación y el de contraseña son del Administrador, por un canal externo |
| El microservicio de fotos | Existe y se levanta, pero **ningún flujo lo llama**: `photo.service.ts` va directo a PostgreSQL. Aparece en el despliegue pero no aquí, porque no participa en ningún mensaje |
| `Refresh` del token | No está en los casos de uso. Si se añade, sería un noveno diagrama |

## Relación con el resto de la documentación

- Las clases que se llaman aquí: [`clases.md`](clases.md)
- La estructura, sin el orden: [`comunicacion.md`](comunicacion.md)
- Dónde corre cada nodo: [`despliegue.md`](despliegue.md)
- De dónde salen estos flujos: [`casos-de-uso.md`](casos-de-uso.md)
