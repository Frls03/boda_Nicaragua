import Monogram from './Monogram';

export default function Hero() {
  return (
    <section className="relative flex w-full justify-center pt-20 sm:pt-24 lg:pt-32 xl:pt-36">
      <div className="relative w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[520px] xl:max-w-[600px]">
        {/* Arco en 2:3, la proporcion de Portada.jpg: la foto no se recorta
            (solo el arco redondea las esquinas superiores). */}
        <div className="overflow-hidden rounded-t-full shadow-[0_14px_34px_-14px_rgba(60,40,30,.55)]">
          <img
            src="/fotos/portada.jpg"
            alt="Jonathan y Jasmin en el jardín"
            fetchpriority="high"
            className="aspect-[2/3] w-full select-none object-cover"
          />
        </div>

        {/* Escudo J&J montado sobre el arco, en diagonal como la referencia. */}
        <div className="absolute left-1/2 top-0 aspect-[94/135] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-[24%/17%] bg-maroon shadow-[0_8px_18px_-6px_rgba(0,0,0,.5)]">
          <Monogram className="h-full w-full fill-cream" />
        </div>
      </div>
    </section>
  );
}
