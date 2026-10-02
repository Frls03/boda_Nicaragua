// Monograma J&J en diagonal (Great Vibes). Coordenadas medidas con Pillow
// sobre la fuente real: SVG ubica cada letra por su linea base, asi la J
// (1.34em de ancho) nunca se sale del escudo. Se usa en el Hero y en el admin.
export default function Monogram({ className = '', title = 'J & J' }) {
  return (
    <svg viewBox="0 0 94 135" role="img" aria-label={title} className={className} style={{ fontFamily: '"Great Vibes", cursive' }}>
      <text x="12.6" y="47.5" fontSize="44">J</text>
      <text x="37.3" y="75.6" fontSize="26">&amp;</text>
      <text x="29.8" y="106.2" fontSize="44">J</text>
    </svg>
  );
}
