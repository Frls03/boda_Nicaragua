---
version: 1
slug: "src-admin"
primary_target: "src/admin"
related_targets: []
---

# Panel de los novios (`/novios`)

Scope: `src/admin/` (AdminPanel, AdminGate, GuestsTab, DashboardTab, TablesTab y sus CSS). Visitor mode: **Operate**.

Audience and job: Jonathan y Jasmin, no técnicos, mayormente en el celular (también tablet y computadora). Cargan invitados (a mano o Excel), reparten contraseñas, siguen confirmaciones y arman mesas. Las tres tareas pesan igual.

Constraints: no cambiar la funcionalidad (mismos datos, acciones, validaciones y flujos; arrastre de mesas con dnd-kit intacto). Colores de la boda (azul marino, corinto, crema) y sus tipografías.

Chosen direction: the category standard, played straight (canon), at the craft level of Linear + Stripe Dashboard + Zola + Airbnb hosting, in a friendly register. Recorded quality bar: those four products.

Memorable moment: el resumen de confirmaciones como una sola barra proporcional (vienen / faltan / no vienen) con el total de personas, legible de un vistazo en el celular.

Unresolved: ninguno.

## Direction contract

THESIS: El panel estándar (navegación lateral, resumen, tabla) ejecutado sin ironía, con el acabado de Linear, Stripe, Zola y Airbnb: amable para novios no técnicos, rechazando la losa azul oscura con emojis y tarjetas sueltas del panel copiado.

OWN-WORLD: Fondo blanco cálido, superficies blancas con filete fino y sombra suave; azul marino de la boda para texto y acción principal, corinto solo como acento de marca y selección. Estados semánticos fijos: verde salvia (viene), ámbar (falta), gris piedra (no viene). Montserrat para toda la interfaz con números tabulares; Cormorant Garamond solo en títulos de sección y en el total de personas de Respuestas (el momento memorable, excepción citada); monograma J&J de la invitación como marca. Íconos Phosphor de un solo trazo; cero emojis.

STORY: Los novios abren el panel, entienden al instante cuántos vienen y quién falta, gestionan invitados sin miedo a romper nada y sientan a cada confirmado en su mesa.

FIRST VIEWPORT: Celular: barra superior con monograma y título; contenido a una columna; barra de pestañas inferior al alcance del pulgar con Invitados, Respuestas y Mesas. Escritorio: barra lateral clara de 248px con monograma, nombres y navegación; contenido a la derecha con título, acciones primarias arriba a la derecha y la tabla de invitados como pieza principal.

FORM: canon (estándar de la categoría), elegido por el usuario en la página de decisión; seed 88b99e0d.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
