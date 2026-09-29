# Invitación de boda — Jonathan & Jasmin

Invitación web de una sola página. React 18 + Vite + Tailwind.
Boda: **17/04/2027**, Jardín Green Box, San Lucas Sacatepéquez, Guatemala.

```bash
npm install
npm run dev      # servidor local
npm run build    # produccion -> dist/
```

## Reglas de diseño

Estas son decisiones tomadas con el cliente, no preferencias. Respetarlas:

1. **Una sola columna, de arriba a abajo, en todos los tamaños.** Se probó un
   layout de dos columnas en escritorio y se rechazó: rompe la lectura
   vertical de una invitación. En pantallas grandes se agranda el contenido,
   nunca se reorganiza en horizontal.
2. **El fondo de papel cubre el ancho completo de la pantalla.** El contenido
   se centra en una columna (620px móvil, 860px `lg`, 980px `xl`). No va
   contenido en una tarjeta angosta con márgenes a los lados.
3. **El floral solo va arriba del módulo 1 y abajo del módulo 2**, difuminado
   con `mask-image`. No es un fondo general.

## Assets

`public/` tiene originales del cliente y derivados generados con Pillow.
**No borrar los originales**: los derivados se regeneran a partir de ellos.

| Derivado | Origen | Proceso |
|---|---|---|
| `fondo1-seamless.jpg` | `fondo1.jpeg` | Recorte central 512px + espejo 2×2. Costura 0.0. **En uso.** |
| `papel-seamless.png` | `papel.jpeg` | Igual. Fondo anterior, sin usar. |
| `floral-sepia.png` | `Fondo_floreado.png` | Recolor a sepia `#7a604a` con alfa. Recortado 6% inferior (marca de agua "TOY"). |
| `floral-cream.png` | `Fondo_floreado.png` | Tono sobre tono crema, para la solapa del sobre. |
| `sello-navy.png` | `Sello.png` | Recolor plata → azul marino. Sobre de apertura. |
| `sello-verso.png` | `Sello.png` | Recolor plata → granate. Tarjeta del versículo. |
| `verso-completo.png` | `marco1.png` + `abajomarco.png` | Papel rasgado (recorte y 202-620, sin el fondo granate) compuesto con las flores (fondo eliminado por flood fill). Papel escalado al ancho de las flores (450px); flores completas con tallos, subiendo por los costados. |

### Por qué están compuestos papel y flores en un solo archivo

Tenían proporciones distintas (0.59 vs 1.22). Estirar las flores al ancho del
papel las deformaba y las dejaba flotando debajo. Compuestos una vez a escala
natural, el macizo floral apoya sobre la base del papel.

### Trampas conocidas al reprocesar imágenes

- **`marco1.png`**: el fondo granate es plano `(60,1,2)`, pero la zona
  sombreada del papel cae dentro de ese rango de color. Una máscara por color
  se come el tercio inferior de la hoja. Usar los límites geométricos
  (papel: x 48-396, y 196-626) y verificar que no queden filas transparentes.
- **Los tiles de papel necesitan espejo 2×2.** Repetir el original directo
  deja costura visible (delta 17-27 entre bordes opuestos). El espejo la deja
  en 0.0 por construcción.
- **`abajomarco.png` y `Fondo_floreado.png`** traen fondo opaco. Hay que
  quitarlo con flood fill desde los bordes, no con máscara global (una máscara
  global también borra el sello, que es del mismo color que el fondo).

## Pendiente

- **La galería repite fotos.** `Gallery.jsx` tiene 5 posiciones y solo hay 3
  imágenes en `public/` (`foto1`, `collage1`, `collage2`). Faltan 2 fotos
  reales, o reducir la grilla a 3.
- **RSVP sin backend.** `src/lib/api.js` habla GraphQL contra
  `VITE_GRAPHQL_ENDPOINT` (ver `.env.example`). Sin esa variable, el RSVP
  guarda en `localStorage` para poder previsualizar el flujo. Los nombres de
  query y mutation (`rsvpStatus`, `submitRsvp`) son un contrato supuesto:
  ajustarlos al schema real del backend.
- **Tope de adultos por invitación.** `Rsvp.jsx` usa `DEFAULT_MAX_GUESTS = 4`
  fijo. Cuando exista el backend (vendrá del admin de otro proyecto), leer el
  max attendees del invitado desde la API y pasarlo a `maxGuests`. El contador
  ya respeta el tope; `submitRsvp` sigue recibiendo `"N persona(s)"`.
- **Sin navegador headless en el entorno.** Los cambios visuales se verifican
  con `npm run build` y mirando la pantalla; no hay tests de regresión visual.

## Texto de la invitación

Datos del cliente (links en las constantes al tope de cada componente):

- **Ubicación** (`Location.jsx`): el cliente escribió "Sacatepeques"; se usa
  la grafía oficial "Sacatepéquez". El botón abre el link de Waze del cliente.
- **Dress Code** (`DressCode.jsx`): "Colores a evitar" corinto, azul marino y
  blanco (son los colores de la boda). El botón abre referencias en Pinterest.
- **Mesa de regalos** (`GiftRegistry.jsx`): lista en Cemaco. Es la única
  tarjeta oscura de la página a propósito: el cliente pidió que no se ignore.
- **RSVP** (`Rsvp.jsx`): fecha límite "01 de marzo del 2027" **sin día de la
  semana**. El cliente pidió "viernes", pero ese día cae lunes; eligió quitarlo.
  Aviso de evento solo para adultos junto al formulario.
