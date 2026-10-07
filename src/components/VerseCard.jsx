export default function VerseCard() {
  return (
    <section className="relative mt-14 px-4 sm:px-8 lg:mt-28">
      <div className="relative mx-auto w-full max-w-[400px] sm:max-w-[460px] lg:max-w-[680px] xl:max-w-[780px]">
        {/* Papel rasgado con las flores al pie, compuestos en un solo asset
            al mismo ancho: las flores suben por los costados del papel. */}
        <img
          src="/verso-completo.png"
          alt=""
          aria-hidden="true"
          className="w-full select-none drop-shadow-[0_14px_30px_rgba(60,40,30,.28)]"
        />

        {/* Texto sobre el papel: termina ~64% del alto, antes de las flores (~71%) */}
        <div className="absolute inset-x-[10%] top-[11%] text-center">
          {/* Linea mas larga = 6.33em y la caja es el 80% de la tarjeta: estos
              tamanos caben a lo ancho y terminan ~64% del alto, antes de las flores. */}
          <blockquote className="font-script leading-[1.75] text-[#24304d] text-[clamp(20px,5.2vw,29px)] lg:text-[44px] xl:text-[50px]">
            Ponme como un sello
            <br />
            sobre tu corazón,
            <br />
            Como un sello sobre
            <br />
            tu brazo,
            <br />
            Porque fuerte como
            <br />
            la muerte es el amor.
          </blockquote>

          <p className="mt-[7%] font-serif font-semibold text-[#1b1b1b] text-[clamp(11px,2.2vw,15px)] lg:text-[19px] xl:text-[22px]">
            Cantares 8:6
            <br />
            NBLA
          </p>
        </div>

        {/* Sello de lacre a caballo sobre el borde superior del papel */}
        <img
          src="/sello-verso.png"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-20 w-[20%] max-w-[96px] lg:max-w-[140px] -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_6px_12px_rgba(60,30,30,.4)]"
        />
      </div>
    </section>
  );
}
