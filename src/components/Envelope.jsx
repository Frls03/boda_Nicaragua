import { useState } from 'react';

export default function Envelope({ onOpened }) {
  const [phase, setPhase] = useState('closed'); // closed -> opening -> leaving -> done

  function handleSealClick() {
    if (phase !== 'closed') return;
    setPhase('opening');
  }

  function handleFlapTransitionEnd(e) {
    if (e.propertyName !== 'transform') return;
    if (phase === 'opening') setPhase('leaving');
  }

  function handleScreenTransitionEnd(e) {
    if (e.target !== e.currentTarget) return;
    if (phase === 'leaving') {
      setPhase('done');
      onOpened();
    }
  }

  if (phase === 'done') return null;

  const isOpening = phase === 'opening' || phase === 'leaving';
  const isLeaving = phase === 'leaving';

  return (
    <div
      onTransitionEnd={handleScreenTransitionEnd}
      className={`bg-paper fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6 transition-opacity duration-700 ${
        isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className="relative aspect-[4/3] w-[86vw] max-w-[360px] sm:max-w-[460px] lg:w-[52vw] lg:max-w-[820px]"
        style={{ perspective: '1400px' }}
      >
        {/* Cuerpo del sobre en papel crema */}
        <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-[#f6f1e4] shadow-[0_18px_40px_-18px_rgba(0,0,0,.35)]">
          <div className="absolute bottom-0 left-0 h-px w-[62%] origin-bottom-left -rotate-[36deg] bg-black/[.07]" />
          <div className="absolute bottom-0 right-0 h-px w-[62%] origin-bottom-right rotate-[36deg] bg-black/[.07]" />
        </div>

        {/* Solapa con el floreado en relieve tono sobre tono */}
        <div
          onTransitionEnd={handleFlapTransitionEnd}
          className={`absolute inset-0 z-[3] origin-top bg-[#f2ecdd] bg-[length:190px_auto] transition-transform duration-[900ms] ease-[cubic-bezier(.6,0,.3,1)] ${
            isOpening ? '[transform:rotateX(-168deg)] [transition-delay:120ms]' : ''
          }`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 62%)',
            backgroundImage: "url('/floral-cream.png')",
          }}
        />

        {/* Sello de lacre azul marino */}
        <button
          onClick={handleSealClick}
          aria-label="Abrir invitación"
          className={`absolute left-1/2 top-[62%] z-[4] h-[21%] w-[23%] max-h-[104px] max-w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 hover:scale-105 ${
            isOpening ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <img
            src="/sello-navy.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.35)]"
          />
        </button>
      </div>

      <p className="animate-pulse text-center uppercase tracking-[.22em] text-[#8a7a6a] text-[clamp(10px,2.6vw,13px)] lg:text-[15px]">
        Toca el sello para abrir
      </p>
    </div>
  );
}
