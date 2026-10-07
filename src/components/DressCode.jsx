const PINTEREST_URL = 'https://pin.it/6TTXUkg2b';

// Colores reservados para la boda: se piden evitar en los invitados.
const avoid = [
  { name: 'Corinto', hex: '#6e1423' },
  { name: 'Azul marino', hex: '#1b2a4a' },
  { name: 'Blanco', hex: '#ffffff' },
];

export default function DressCode() {
  return (
    <section className="mt-10 rounded-t-[26px] bg-white/85 px-6 pb-7 pt-7 lg:mt-16 lg:rounded-t-[34px] lg:px-12 lg:pb-11 lg:pt-12 text-center text-ink shadow-[0_8px_26px_-14px_rgba(60,40,30,.5)] backdrop-blur-[2px]">
      <h2 className="font-script leading-none text-maroon text-[clamp(28px,7vw,36px)] lg:text-[50px]">Dress Code</h2>

      <p className="mx-auto mt-3 max-w-[300px] font-medium leading-snug text-[clamp(14px,3.6vw,16px)] lg:max-w-[440px] lg:text-[20px]">
        Hombres corbata y traje sastre,
        <br />
        mujeres vestido largo elegante.
      </p>

      <p className="mt-5 font-serif font-semibold uppercase tracking-[.18em] text-[#3d3128] text-[clamp(11px,2.8vw,13px)] lg:mt-8 lg:text-[16px]">
        Colores a evitar
      </p>

      <ul className="mt-3 flex justify-center gap-5 lg:mt-4 lg:gap-8">
        {avoid.map((c) => (
          <li key={c.name} className="flex flex-col items-center gap-1.5 lg:gap-2">
            <span
              aria-hidden="true"
              className="h-7 w-7 rounded-full lg:h-10 lg:w-10 shadow-[inset_0_0_0_1px_rgba(0,0,0,.18)]"
              style={{ background: c.hex }}
            />
            <span className="text-[clamp(11px,2.8vw,13px)] lg:text-[16px] text-[#3d3128]">{c.name}</span>
          </li>
        ))}
      </ul>

      <a
        href={PINTEREST_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-[#2b3653] px-8 py-2 text-[10px] lg:mt-9 lg:px-12 lg:py-3 lg:text-[13px] font-medium tracking-[.2em] text-cream transition-colors duration-300 hover:bg-maroon"
      >
        VER REFERENCIAS
      </a>
    </section>
  );
}
