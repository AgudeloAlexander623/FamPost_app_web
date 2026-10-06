# Diagramas de despliegue - Photos APP

Los diagramas de despliegue muestran **dónde se ejecuta cada pieza**: qué
servidores, qué puertos, qué procesos y cómo se comunican entre ellos. Es la
vista que convierte el software en algo que se puede instalar y arrancar.

Código fuente en `docs/diagramas/despliegue/`. Los bloques de este documento se
generan con `docs/sync-diagramas.ps1`.

## Por qué están separados desarrollo y producción

Es la decisión más importante de este documento, y por eso hay dos diagramas en
lugar de uno.

Un diagrama de despliegue único tendría que mezclar dos cosas que no se mezclan:

- **Lo que funciona hoy:** cuatro servicios y una base de datos en la misma
  máquina, puertos abiertos, `Vite` haciendo de servidor de desarrollo.
- **Lo que se proyecta:** un servidor con proxy inverso y HTTPS, la base de datos
  en otra máquina, los servicios sin acceso desde Internet.

Mezclados, el diagrama daría a entender que el proxy inverso y el HTTPS ya están
montados, y no es así. Separados, cada uno se lee con la pregunta correcta: el
primero es "cómo lo arranco hoy", el segundo es "cómo lo publico".

**El diagrama 2 no describe nada implementado.** Está marcado como objetivo en la
propia figura. Se mantiene porque es la respuesta a la pregunta que siempre sale en
la defensa del proyecto —"¿y esto cómo se despliega?"— y porque muestra qué
cambios haría falta. Si en algún momento se implementa, hay que actualizar el
título y las notas para que deje de decir "NO implementado".

## Convenciones

| Convención | Significado |
| ---------- | ----------- |
| `node` | Un equipo o un entorno (Windows, WSL2, un servidor) |
| Caja dentro de un `node` | Un proceso o servicio que corre dentro de ese equipo |
| `database` | Solo para PostgreSQL. Es lo único que guarda datos |
| `X --> Y : protocolo puerto` | La etiqueta lleva siempre el protocolo y el puerto. Un enlace sin puerto en este proyecto es un error |
| Sin tildes en el `.puml` | Evita fallos de codificación en el renderizador público. En este `.md` sí se usan |

## La diferencia entre los dos entornos, resumida

| | Desarrollo (diagrama 1) | Producción (diagrama 2) |
| - | ----------------------- | ----------------------- |
| Equipos | Windows 11 + WSL2 | Un servidor de aplicación + un servidor de datos |
| Puertos visibles | 5173, 4000, 8080, 8000, 5432 | Solo el **443** abierto a Internet |
| Quién sirve el HTML | `Vite` en modo desarrollo | Archivos estáticos tras el proxy |
| Quién resuelve CORS | El proxy de `Vite` | El proxy inverso (Nginx) |
| HTTPS | No | Sí, terminado en el proxy |
| Base de datos | Misma máquina | Otra máquina, red privada |
| Escenario real | **Sí** | **No, es un objetivo** |

La fila de CORS merece la pena: durante el desarrollo nunca hubo que configurar
CORS en el `BackEnd`, porque el proxy de `Vite` reescribe `/api` y el navegador
solo ve un origen. Ese detalle es cómodo hasta que se publica, y es
precisamente lo que el diagrama 2 señala con una nota.

---

# Diagrama 1 — Entorno de desarrollo (cómo está hoy)

Topología real: el navegador en Windows, y todo lo demás en WSL2.

```plantuml
@startuml
title Diagrama de despliegue 1 - Entorno de desarrollo (como esta hoy)

skinparam shadowing false
hide circle

node "Windows 11" as WIN {
  node "Navegador" as NAV
}

node "WSL2 (Ubuntu)" as WSL {
  node "FrontEnd\nReact 19 + TypeScript\nVite dev server :5173" as FE

  node "BackEnd\nNode 24 + Express\n:4000" as BE

  node "Security\nJava 21 + Spring Boot\n:8080" as BE_SEC

  node "MicroServicios\nPython 3 + FastAPI\n:8000" as MS

  database "PostgreSQL 18\nbase photos_app\n:5432" as DB
}

NAV --> FE : HTTP :5173\n(el proxy de Vite\nreescribe /api hacia :4000)

BE --> DB : SQL\n(TypeORM, puerto 5432)
BE --> MS : HTTP :8000
BE --> BE_SEC : HTTP :8080\nPOST /api/auth/login

note top of WSL
  Los cuatro servicios y la base de datos
  comparten la misma maquina: es lo que hace
  comodo developing. En este diagrama se ven los
  puertos reales, no los conceptuales.
end note

note right of NAV
  En WSL2 el navegador de Windows alcanza los
  puertos de Linux en localhost gracias al
  reenvio de localhost de WSL. Por eso no hace
  falta configurar CORS: el proxy de Vite ya
  hace de intermediario.
end note

note bottom of DB
  PostgreSQL se instalo sin sudo, con el socket
  en ~/.pgsock en vez de /var/run/postgresql.
  Por eso los atajos pg_start y pg_status de
  ~/.bashrc son necesarios: ajustan el PATH y el
  LD_LIBRARY_PATH a mano.
end note

note bottom of BE_SEC
  Security valida contra los usuarios fijos de
  application.yml. Todavia no lee de la base de
  datos, que es lo que habria que cambiar para
  dar de alta usuarios con invitacion.
end note

note as NALMACEN
  |Lo que NO hay|
  --
  No hay nodo de almacen de archivos: el sistema
  guarda la URL de cada fotografia, no el binario.
  Por eso en este entorno no existe ninguna
  carpeta de uploads que mantener.
end note
@enduml
```

**Sobre el reenvío de localhost de WSL2.** El diagrama se dibujó con el navegador
en un `node` aparte del de los servicios, y eso merece una explicación: en WSL2 el
navegador de Windows alcanza los puertos de Linux en `localhost` porque WSL2
expone esa traducción por el mecanismo de reenvío de localhost. No hay
configuración de red de por medio, y por eso tampoco hay CORS que configurar en
desarrollo.

Es un detalle del entorno, no de la arquitectura, pero se dibujó igualmente
porque es lo que hace que funcione sin configurar ficheros ni IPs fijas.

**Sobre `PostgreSQL`.** Se instaló sin `sudo` y con el socket en `~/.pgsock` en
lugar de `/var/run/postgresql`. Por eso los atajos `pg_start` y `pg_status` de
`~/.bashrc` no son comodidad: sin ellos, `psql` no encuentra el servidor, porque
el `PATH` y el `LD_LIBRARY_PATH` no apuntan a la instalación del usuario.

# Diagrama 2 — Objetivo de producción (**no implementado**)

```plantuml
@startuml
title Diagrama de despliegue 2 - Objetivo de produccion (NO implementado)

skinparam shadowing false
hide circle

node "Cliente\nnavegador en Internet" as CLI

node "Servidor de aplicacion" as SRV_APP {
  node "Proxy inverso\n(Nginx)\nHTTPS :443" as PROXY

  node "FrontEnd\nbuild estatico de Vite" as FE

  node "BackEnd\nNode 24 + Express\n:4000" as BE

  node "Security\nJava 21 + Spring Boot\n:8080" as BE_SEC

  node "MicroServicios\nPython 3 + FastAPI\n:8000" as MS
}

node "Servidor de datos" as SRV_DB {
  database "PostgreSQL 18\nbase photos_app\n:5432" as DB
}

CLI --> PROXY : HTTPS :443\n(unico puerto abierto\na Internet)

PROXY --> FE : HTTP interno\n(sirve los archivos estaticos)
PROXY --> BE : HTTP :4000\n(reenvia solo /api)
BE --> MS : HTTP :8000
BE --> BE_SEC : HTTP :8080
BE --> DB : SQL :5432\n(red privada)

note top of CLI
  OBJETIVO, NO IMPLEMENTADO.

  Este diagrama no describe lo que hay hoy, sino
  como quedaria el sistema al publicarlo. Se
  separa del diagrama 1 a proposito para que no
  se confundan "lo que funciona" con "lo que se
  pretende hacer".
end note

note right of PROXY
  Todo el trafico entra por aqui. El proxy es el
  unico punto abierto: el BackEnd, Security y
  MicroServicios se quedan sin acceso desde
  Internet.

  Ahi es donde se terminan los problemas de CORS:
  en desarrollo los resolvio el proxy de Vite,
  pero ahi no es un servidor real.
end note

note bottom of FE
  En produccion no hay servidor de desarrollo:
  Vite compila los archivos y los sirve como
  estaticos. Por eso desaparecen el puerto 5173
  y el hot reload.
end note

note bottom of DB
  Base de datos en otra maquina y con la
  configuracion de la red privada. Sigue sin
  exponerse al exterior.
end note

note bottom of BE_SEC
  En produccion los usuarios dejan de estar en
  application.yml y pasan a leerse de PostgreSQL.
  Es el cambio que exige el registro por
  invitacion (UC01 y UC47).
end note

note as NALMACEN
  |PENDIENTE DE DECIDIR|
  --
  Donde se guardan los archivos de las
  fotografias. Hoy se guarda la URL, asi que el
  sistema depende de un servicio externo. Cuando
  se decida (disco del servidor, o almacen de
  objetos) habra que anadir aqui su nodo.
end note

note as NEXCL
  |Excluido a proposito|
  --
  No se dibujan mas de una instancia de cada
  servicio, ni balanceo, ni tolerancia a fallos.
  El proyecto no tiene esa necesidad y anadirlo
  solo haria el diagrama mas dificil de leer sin
  aportar informacion.
end note
@enduml
```

---

## Inventario: qué corre y en qué puerto

| Proceso | Puerto | Dónde vive hoy | Tecnología |
| ------- | ------ | --------------- | ---------- |
| FrontEnd (Vite) | 5173 | WSL2 | React 19 + TypeScript |
| BackEnd | 4000 | WSL2 | Node 24 + Express + TypeScript |
| Security | 8080 | WSL2 | Java 21 + Spring Boot |
| MicroServicios | 8000 | WSL2 | Python 3 + FastAPI |
| PostgreSQL | 5432 | WSL2 | PostgreSQL 18, base `photos_app` |

## Protocolos por enlace

| Enlace | Protocolo | Nota |
| ------ | --------- | ---- |
| Navegador → FrontEnd | HTTP :5173 | En desarrollo no hay HTTPS; el proxy de `Vite` reescribe `/api` hacia `:4000` |
| BackEnd → PostgreSQL | SQL :5432 | TypeORM. El pool de conexiones es un parámetro de configuración, no un enlace: por eso no se dibuja |
| BackEnd → Security | HTTP :8080 | `POST /api/auth/login`. Es el único microservicio que el `BackEnd` usa de verdad |
| BackEnd → MicroServicios | HTTP :8000 | **Declarado pero sin uso.** `photo.service.ts` va directo a PostgreSQL. `env.ts` lee `PHOTOS_SERVICE_URL` y no lo usa nadie |
| Proxy → BackEnd | HTTP :4000 | Solo en producción, y solo reenviando `/api` |

## Lo que este diagrama destapa

Tres cosas que no se ven en los otros diagramas y que conviene tener presentes:

1. **El `BackEnd` no valida el JWT.** No hay middleware de autenticación, así que
   cualquiera que llegue a `:4000` usa la API. `JWT_SECRET` está en el `.env` y no
   lo lee nadie. Es el punto más urgente de todo el proyecto.
2. **El microservicio de fotos está levantado y no se usa.** Aparece en el
   diagrama porque existe y escucha en el 8000, pero ningún flujo pasa por él. O
   se conecta con el `BackEnd` para el alta de fotos, o se quita del diagrama.
3. **`Security` valida contra dos usuarios fijos** (`admin/admin123` y
   `usuario/usuario123`) declarados en `application.yml`, no contra la base de
   datos. Por eso el registro por invitación (UC01 y UC47), aunque se implemente,
   no funcionaría hasta que `Security` lea de PostgreSQL.

## Qué falta decidir

| Pendiente | Por qué bloquea al diagrama |
| --------- | --------------------------- |
| Dónde se guardan los archivos de las fotografías | Hoy se guarda la **URL**, así que el sistema depende de un servicio externo. Cuando se decida (disco del servidor o almacén de objetos) hay que añadir un nodo nuevo a los dos diagramas |
| Cuántas instancias de cada servicio | Ahora hay una. Si el despliegue tuviera más de una, habría que decidir balanceo, sesiones compartidas y qué pasa con el token |
| Dónde vive la base de datos | En el objetivo está en otra máquina, pero no está decidido si es un servidor propio o un servicio gestionado |
| Si el 8000 se queda o se quita | Depende de la decisión 2 del inventario anterior. Un nodo que no participa en ningún flujo confunde más que ayuda |

## Relación con el resto de la documentación

- Las clases que se ejecutan en cada proceso: [`clases.md`](clases.md)
- Los mensajes entre esos procesos: [`secuencia.md`](secuencia.md)
- La red de colaboración: [`comunicacion.md`](comunicacion.md)
