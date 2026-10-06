# Diagramas - Photos APP

Índice de los 25 diagramas del proyecto, agrupados por tipo. Cada tipo tiene su
propio documento `.md` en [`docs/`](../), con la explicación, las decisiones y las
tablas de cobertura. Aquí solo está la fuente `.puml`.

## Contenido

| Carpeta | Tipo | Diagramas | Documento |
| ------- | ---- | --------- | --------- |
| [`casos-de-uso/`](casos-de-uso) | Casos de uso | 7 | [`casos-de-uso.md`](../casos-de-uso.md) |
| [`clases/`](clases) | Clases | 4 | [`clases.md`](../clases.md) |
| [`secuencia/`](secuencia) | Secuencia | 8 | [`secuencia.md`](../secuencia.md) |
| [`comunicacion/`](comunicacion) | Comunicación | 4 | [`comunicacion.md`](../comunicacion.md) |
| [`despliegue/`](despliegue) | Despliegue | 2 | [`despliegue.md`](../despliegue.md) |
| | | **25** | |

## Los 25 diagramas

### Casos de uso — 7

| Fichero | Diagrama | Casos de uso |
| ------- | -------- | ------------ |
| `casos-de-uso/01-autenticacion.puml` | Autenticación y acceso | UC01–UC08 |
| `casos-de-uso/02-perfil-usuarios.puml` | Perfil y usuarios | UC09–UC16 |
| `casos-de-uso/03-publicaciones.puml` | Publicaciones | UC17–UC23, UC46 |
| `casos-de-uso/04-interacciones.puml` | Interacciones | UC24–UC30 |
| `casos-de-uso/05-fotografias.puml` | Fotografías y contenido multimedia | UC18, UC31–UC36 |
| `casos-de-uso/06-notificaciones.puml` | Notificaciones | UC37–UC41 |
| `casos-de-uso/07-administracion.puml` | Administración | UC42–UC45, UC47 |

### Clases — 4

| Fichero | Diagrama | Clases |
| ------- | -------- | ------ |
| `clases/01-identidad.puml` | Identidad, roles y acceso | `Usuario`, `Rol`, `Seguimiento`, `Invitacion`, `Sesion` |
| `clases/02-publicaciones.puml` | Publicaciones y fotografías | `Publicacion`, `Fotografia` |
| `clases/03-interacciones.puml` | Interacciones | `Comentario`, `Reaccion`, `TipoReaccion` |
| `clases/04-notificaciones.puml` | Notificaciones | `Notificacion`, `TipoNotificacion`, `EstadoNotificacion` |

### Secuencia — 8

| Fichero | Diagrama | Casos de uso | ¿Funciona hoy? |
| ------- | -------- | ------------ | -------------- |
| `secuencia/01-inicio-sesion.puml` | Iniciar sesión | UC02, UC08 | **Sí** |
| `secuencia/02-registro-invitacion.puml` | Registrarse con invitación | UC01 | No |
| `secuencia/03-emitir-invitacion.puml` | Emitir invitación | UC47 | No |
| `secuencia/04-crear-publicacion.puml` | Crear publicación con fotografía | UC17, UC18, UC31 | Parcial |
| `secuencia/05-consultar-feed.puml` | Consultar el feed | UC22 | No |
| `secuencia/06-comentar-publicacion.puml` | Comentar una publicación | UC24 | No |
| `secuencia/07-reaccionar-publicacion.puml` | Reaccionar a una publicación | UC27 | No |
| `secuencia/08-recuperar-contrasena.puml` | Recuperar y restablecer la contraseña | UC06, UC45 | No |

### Comunicación — 4

| Fichero | Diagrama | Casos de uso |
| ------- | -------- | ------------ |
| `comunicacion/01-autenticacion.puml` | Autenticación | UC02, UC08 |
| `comunicacion/02-publicaciones.puml` | Crear publicación con fotografía | UC17, UC18, UC31 |
| `comunicacion/03-interacciones.puml` | Comentar y reaccionar | UC24, UC27 |
| `comunicacion/04-notificaciones.puml` | Notificaciones | UC37, UC38 |

### Despliegue — 2

| Fichero | Diagrama | Realidad |
| ------- | -------- | -------- |
| `despliegue/01-desarrollo-local.puml` | Entorno de desarrollo | **Sí, es como está hoy** |
| `despliegue/02-produccion.puml` | Objetivo de producción | **No, no está implementado** |

## Convención de nombres

```
NN-nombre-del-diagrama.puml
```

- **Dos dígitos** para el orden de lectura dentro de la carpeta. El número va en
  el nombre, no solo en el `title`, para que los ficheros se ordenen solos en el
  explorador.
- **Minúsculas y guiones**, sin tildes ni espacios. En Linux los nombres con
  espacios dan problemas al abrirlos desde otros sistemas.
- El `title` del diagrama **sí** lleva el tipo y el número, para que la figura se
  identifique sola cuando se renderiza suelta:

```plantuml
title Diagrama de clases 2 - Publicaciones y fotografias
```

- Un fichero = un diagrama. No hay dos `@startuml` en el mismo fichero.

## Convenciones de contenido

Estas reglas se aplicaron en los 25 diagramas:

| Regla | Motivo |
| ----- | ------ |
| **Sin tildes ni caracteres especiales en el `.puml`** | El renderizador público a veces devuelve la página HTML en vez del SVG cuando el fuente lleva caracteres fuera de ASCII. Con texto plano el resultado es siempre correcto. En los `.md` sí se usan tildes |
| `skinparam shadowing false` | La sombra de PlantUML no añade información y ocupa espacio |
| `hide circle` en clases | Los círculos de enumeración sobran en un diagrama de clases |
| `skinparam shadowing false` también en secuencia y despliegue | Por la misma razón |
| `autonumber` en los diagramas de secuencia | Obliga a leer en orden, que es la mitad del valor del diagrama |
| Cada decisión lleva un `note` | Un diagrama que obliga a adivinar por qué se tomó una decisión no sirve para defender el proyecto |
| Una `note as NEXCL` o similar por lo que se deja fuera | Lo que se decide no modelar es tan importante como lo que se modela |

## Cómo renderizar

**Opción 1 · Web, sin instalar nada.** En <https://www.plantuml.com/plantuml> se
pega el contenido del `.puml` y se descarga el SVG. También vale la extensión
oficial de navegador para GitHub.

**Opción 2 · Local, para trabajar sin conexión y con diffs.** Con el JAR de
PlantUML:

```bash
java -jar plantuml.jar -tsvg -o svg docs/diagramas/*/*.puml
```

**Opción 3 ·VS Code.** Con la extensión *PlantUML* (jebbs) se ve la vista previa
al guardar el fichero.

> Si el renderizador devuelve un error de sintaxis, suele ser por una de estas dos
> cosas: una etiqueta de flecha partida en varias líneas (no se puede: hay que
> usar `\n` en una sola línea) o un `else` dentro de un `group` (no existe: hay
> que usar `alt`).

## Mantener el código sincronizado con la documentación

Cada documento `.md` de `docs/` **incrusta el código fuente** de sus diagramas en
un bloque ` ```plantuml `. Para no tener que copiar a mano:

```bash
pwsh -ExecutionPolicy Bypass -File docs/sync-diagramas.ps1
```

Ese script vuelca cada `.puml` dentro de su bloque, emparejando **por posición**.
Si avisa de que el número de bloques no coincide con el número de `.puml`,
significa que hay que añadir o quitar un bloque en el `.md` (o que un ejemplo de
sintaxis debería llevar ` ```text ` en vez de ` ```plantuml `).

Con `-Comprobar` solo informa del desfase sin escribir nada, que es lo que
conviene antes de un commit.

## Orden de lectura recomendado

Si vienes de nuevo al proyecto, este es el camino, y está en el orden en que se
construyó el modelo:

1. [`casos-de-uso.md`](../casos-de-uso.md) — qué hace el sistema y por qué.
2. [`clases.md`](../clases.md) — cómo se traduce eso a datos.
3. [`secuencia.md`](../secuencia.md) — qué mensajes happen y en qué orden.
4. [`comunicacion.md`](../comunicacion.md) — quién habla con quién, sin orden.
5. [`despliegue.md`](../despliegue.md) — dónde corre cada cosa.

El paso natural después es el **modelo entidad-relación**, que ya no está
escrito: es la traducción de los 4 diagramas de clases a tablas, columnas y claves
foráneas.
