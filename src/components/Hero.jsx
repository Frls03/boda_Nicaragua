export default function Hero() {
  return (
    <section className="relative flex w-full justify-center pt-20 sm:pt-24 lg:pt-32 xl:pt-36">
      <div className="relative w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[520px] xl:max-w-[600px]">
        {/* Arco alto (1:1.7), como el diseno de referencia */}
        <div className="overflow-hidden rounded-t-full shadow-[0_14px_34px_-14px_rgba(60,40,30,.55)]">
          <img
            src="/foto1.png"
            alt="Jonathan y Jasmin"
            className="aspect-[1/1.7] w-full select-none object-cover grayscale"
          />
        </div>

        {/* Escudo J&J montado sobre el arco, en diagonal como la referencia.
            SVG porque ubica cada letra por su linea base: la J de Great Vibes
            mide 1.34em de ancho y con texto HTML se salia del escudo.
            Coordenadas medidas con Pillow sobre la fuente real. */}
        <div className="absolute left-1/2 top-0 aspect-[94/135] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-[24%/17%] bg-maroon shadow-[0_8px_18px_-6px_rgba(0,0,0,.5)]">
          <svg viewBox="0 0 94 135" role="img" aria-label="J & J" className="h-full w-full fill-cream font-script">
            <text x="12.6" y="47.5" fontSize="44">J</text>
            <text x="37.3" y="75.6" fontSize="26">&amp;</text>
            <text x="29.8" y="106.2" fontSize="44">J</text>
          </svg>
        </div>
      </div>
    </section>
  );
}
