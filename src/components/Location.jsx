const WAZE_URL =
  'https://ul.waze.com/ul?venue_id=176554130.1765279157.23785344&overview=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location';

export default function Location() {
  return (
    <section className="rounded-b-[26px] bg-white/85 px-6 pb-8 pt-3 lg:rounded-b-[34px] lg:px-12 lg:pb-12 lg:pt-5 text-center text-ink shadow-[0_8px_26px_-14px_rgba(60,40,30,.5)] backdrop-blur-[2px]">
      <img src="/ubi1.png" alt="" aria-hidden="true" className="mx-auto h-8 w-auto select-none lg:h-12" />

      <h2 className="mt-2 font-script leading-none text-maroon text-[clamp(28px,7vw,36px)] lg:text-[50px]">
        Ubicación
      </h2>

      <p className="mx-auto mt-2 max-w-[310px] leading-snug text-[clamp(13px,3.2vw,15px)] lg:max-w-[460px] lg:text-[20px]">
        <span className="font-semibold">Jardín Green Box</span>
        <br />
        Acceso a Cerro Alux, Km. 27,
        <br />
        San Lucas Sacatepéquez
      </p>

      <a
        href={WAZE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block rounded-full bg-[#2b3653] px-8 py-2 text-[10px] lg:mt-8 lg:px-12 lg:py-3 lg:text-[13px] font-medium tracking-[.2em] text-cream transition-colors duration-300 hover:bg-maroon"
      >
        ABRIR WAZE
      </a>
    </section>
  );
}
