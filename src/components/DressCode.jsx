import { useState } from 'react';

const colors = [
  { name: 'Marrón', hex: '#8a4b2a' },
  { name: 'Verde botella', hex: '#1c4d40' },
  { name: 'Petróleo', hex: '#1f5566' },
  { name: 'Rojo', hex: '#a51c2c' },
  { name: 'Negro', hex: '#111111' },
];

export default function DressCode() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mt-10 rounded-t-[26px] bg-white/85 px-6 pb-7 pt-7 lg:mt-16 lg:rounded-t-[34px] lg:px-12 lg:pb-11 lg:pt-12 text-center text-ink shadow-[0_8px_26px_-14px_rgba(60,40,30,.5)] backdrop-blur-[2px]">
      <h2 className="font-script leading-none text-maroon text-[clamp(28px,7vw,36px)] lg:text-[50px]">Dress Code</h2>

      <p className="mx-auto mt-3 max-w-[300px] leading-snug text-[clamp(13px,3.2vw,15px)] lg:max-w-[440px] lg:text-[20px]">
        Hombres corbata y traje sastre,
        <br />
        mujeres vestido largo elegante.
      </p>

      <div className="mt-4 flex justify-center gap-2 lg:mt-7 lg:gap-3">
        {colors.map((c) => (
          <span
            key={c.name}
            title={c.name}
            className="h-6 w-8 rounded-[2px] lg:h-9 lg:w-12 shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)] transition-transform duration-300 hover:-translate-y-0.5"
            style={{ background: c.hex }}
          />
        ))}
      </div>

      {expanded && (
        <p className="mt-3 text-[11px] text-gray-600">{colors.map((c) => c.name).join(' · ')}</p>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-5 rounded-full bg-[#2b3653] px-10 py-2 text-[10px] lg:mt-8 lg:px-14 lg:py-3 lg:text-[13px] font-medium tracking-[.2em] text-cream transition-colors duration-300 hover:bg-maroon"
      >
        VER
      </button>
    </section>
  );
}
