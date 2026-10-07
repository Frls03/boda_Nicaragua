# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Jonathan y Jasmin (los novios)**: usuarios principales del panel de administración (`/novios`). No son técnicos. Cargan la lista de invitados (a mano o por Excel), reparten las contraseñas, siguen las confirmaciones y arman las mesas. Lo usan sobre todo desde el celular, en ratos sueltos, sin descartar tablet o computadora.
- **Luis (desarrollador)**: monitorea; no es el usuario del día a día.
- **Invitados**: entran a la invitación (`/`) con su contraseña, la abren y confirman asistencia. Nunca ven el admin.

## Product Purpose

Invitación web de una sola página para la boda de Jonathan & Jasmin (17/04/2027, Jardín Green Box, San Lucas Sacatepéquez, Guatemala), con confirmación de asistencia personalizada por invitado y un panel privado para que los novios administren la lista, vean las respuestas y acomoden a los confirmados en mesas.

Éxito: los novios saben en todo momento cuántos vienen, quién falta por responder y dónde se sienta cada uno, sin depender del desarrollador.

## Positioning

Cada invitación es personal: una contraseña por invitado que fija su nombre y su máximo de adultos, validado en el servidor. El acomodo de mesas es gráfico (mesas circulares con sillas numeradas, arrastrar en computadora y mantener presionado en celular) y reserva sillas contiguas según cuántas personas trae cada invitación.

## Operating Context

- Flujo del invitado: contraseña -> sobre -> invitación -> confirmación (sí/no y cantidad de adultos hasta su máximo; sin notas).
- Flujo de los novios en `/novios`: login con correo y contraseña (Supabase Auth, lista de admins permitidos); pestañas Invitados (alta/edición/baja, plantilla e importación de Excel, copiar mensaje con link y contraseña), Ver invitaciones (totales y progreso por estado), Mesas (crear mesas con capacidad, asignar sillas).
- Fecha límite de confirmación: 01 de marzo del 2027.
- La celebración es solo para adultos.

## Capabilities and Constraints

- React 18 + Vite + Tailwind; admin con CSS propio bajo `.adm-theme`. Backend Supabase (`supabase/migrations/`, guia en `supabase/README.md`). Modo demo local mientras no haya `.env`.
- Admin replicado de `github.com/Frls03/webapp_bodanica`: la funcionalidad del admin no se cambia sin pedido explícito.
- Estados de asistencia: pendiente, confirmado, no asistirá.

## Brand Commitments

- Colores de la boda: azul marino, granate (corinto) y crema/papel. El cliente pidió que el admin use los colores de esta boda.
- Tipografías de la invitación: Great Vibes (caligráfica), Cormorant Garamond, Montserrat.
- Reglas de la invitación pública (no del admin): una sola columna de arriba a abajo; fondo de papel a todo el ancho; floral solo arriba del módulo 1 y abajo del módulo 2; fotos a color y sin recortar.

## Evidence on Hand

- Fotos reales de la pareja en `public/fotos/` (portada y collage), sellos de lacre (`sello-navy.png`, `sello-verso.png`), florales y papel en `public/`.
- No hay testimonios, métricas ni datos reales de invitados todavía: el modo demo usa invitados ficticios.

## Product Principles

1. Los novios no son técnicos: cada estado y cada acción tienen que entenderse sin explicación.
2. El celular es el escenario principal; ninguna tarea puede depender de un mouse.
3. Confirmaciones, invitados y mesas pesan lo mismo: ninguna sección es secundaria.
4. El admin pertenece a la misma boda que la invitación, no a una herramienta genérica.
