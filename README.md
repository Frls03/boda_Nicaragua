# Invitación de boda — Jonathan & Jasmin

Invitación web de una página para la boda del **01/02/2027** en Santa Cruz de
la Sierra, Bolivia.

React 18 · Vite · Tailwind CSS

## Arranque

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # produccion -> dist/
npm run preview   # sirve el build
```

## RSVP

El formulario habla GraphQL contra el endpoint de `VITE_GRAPHQL_ENDPOINT`.

```bash
cp .env.example .env
# editar .env con la URL real del backend
```

Sin esa variable el RSVP guarda en `localStorage`, suficiente para
previsualizar el flujo pero no para recibir confirmaciones reales.

## Estructura

```
src/
  App.jsx              layout de una columna, bandas florales
  components/
    Envelope.jsx       sobre de apertura con sello de lacre
    Hero.jsx           foto en arco + escudo J&J
    VerseCard.jsx      versiculo sobre papel rasgado
    Gallery.jsx        mosaico de fotos
    DressCode.jsx      codigo de vestimenta y paleta
    Location.jsx       direccion + enlace a Waze
    Rsvp.jsx           confirmacion de asistencia
  lib/api.js           cliente GraphQL + respaldo local
scripts/
  generar-assets.py    regenera los derivados de public/
```

## Assets

`public/` mezcla originales del cliente con derivados generados por script.
Para reconstruir los derivados:

```bash
pip install pillow numpy
python scripts/generar-assets.py
```

Ver [CLAUDE.md](CLAUDE.md) para el detalle de cada asset, las decisiones de
diseño que hay que respetar y las trampas conocidas al reprocesar las imágenes.
