const LIST_CODE = 'BODANICARAGUAGOMEZ17042027';
const CEMACO_URL = `https://www.cemaco.com/list/${LIST_CODE}`;

// Unica tarjeta oscura de la pagina, a proposito: tiene que destacar.
export default function GiftRegistry() {
  return (
    <section className="relative mt-20 rounded-[26px] bg-[#2b3653] px-6 pb-9 pt-14 lg:mt-28 lg:rounded-[34px] lg:px-14 lg:pb-14 lg:pt-20 text-center text-cream shadow-[0_18px_40px_-16px_rgba(20,25,45,.7)]">
      {/* Sello de lacre a caballo sobre el borde, como en la tarjeta del versiculo.
          z-10: por encima del filete interior, que va despues en el DOM. */}
      <img
        src="/sello-verso.png"
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-10 w-[76px] -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_6px_12px_rgba(20,10,10,.45)] lg:w-[110px]"
      />

      <div className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-cream/25 lg:inset-4 lg:rounded-[26px]" />

      <h2 className="relative font-script leading-none text-[clamp(34px,8.5vw,44px)] lg:text-[62px]">Mesa de regalos</h2>

      <p className="relative mx-auto mt-4 max-w-[320px] leading-relaxed text-cream/90 text-[clamp(14px,3.4vw,16px)] lg:mt-6 lg:max-w-[520px] lg:text-[21px]">
        Su presencia es nuestro mejor regalo. Si desean tener un detalle con nosotros, pueden hacerlo a través de nuestra
        mesa de regalos en Cemaco.
      </p>

      <a
        href={CEMACO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-7 inline-flex items-center gap-2.5 rounded-full bg-cream px-8 py-3.5 text-[11px] font-semibold tracking-[.2em] text-[#2b3653] shadow-[0_8px_20px_-8px_rgba(0,0,0,.6)] transition-colors duration-300 hover:bg-white lg:mt-10 lg:px-12 lg:py-4 lg:text-[14px]"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
        </svg>
        VER MESA DE REGALOS
      </a>

      <p className="relative mt-6 text-cream/65 text-[clamp(11px,2.6vw,12px)] lg:mt-8 lg:text-[15px]">
        Código de lista en tienda
        <br />
        <span className="font-sans tracking-[.08em] text-cream/90 break-all">{LIST_CODE}</span>
      </p>
    </section>
  );
}
