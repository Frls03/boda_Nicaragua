import { useState } from 'react';
// Acuarela azul detras del sobre y sello granate (colores invertidos a pedido
// de los novios). Sale de public/acuarela.png (scripts/generar-assets.py); la
// version granate anterior sigue en '/acuarela-sobre-granate.png'. La mancha
// ocupa ~60% de su imagen: se dibuja mas grande que el sobre para que asome.
const ACUARELA = '/acuarela-sobre-azul.png';

export default function Envelope({ onLeaving, onOpened }) {
  const [phase, setPhase] = useState('closed'); // closed -> opening -> leaving -> done

  function handleSealClick() {
    if (phase !== 'closed') return;
    setPhase('opening');
  }

  function handleFlapTransitionEnd(e) {
    if (e.propertyName !== 'transform') return;
    if (phase === 'opening') {
      setPhase('leaving');
      // la invitacion empieza a aparecer mientras el sobre se desvanece
      onLeaving?.();
    }
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
      className={`bg-paper fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden px-6 transition-opacity duration-700 ${
        isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className="relative aspect-[4/3] w-[86vw] max-w-[360px] sm:max-w-[460px] lg:w-[52vw] lg:max-w-[820px]"
        style={{ perspective: '1400px' }}
      >
        {/* Acuarela granate detras: separa el sobre crema del fondo crema */}
        <img
          src={ACUARELA}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-1/2 aspect-square max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-contain w-[205%] lg:w-[215%]`}
        />

        {/* Cuerpo del sobre en papel crema, con filete y sombra marcados */}
        <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-[#f6f1e4] shadow-[0_0_0_1px_rgba(43,54,83,.22),0_26px_50px_-18px_rgba(20,28,50,.55)]">
          <div className="absolute bottom-0 left-0 h-px w-[62%] origin-bottom-left -rotate-[36deg] bg-[#5a3a2a]/[.18]" />
          <div className="absolute bottom-0 right-0 h-px w-[62%] origin-bottom-right rotate-[36deg] bg-[#5a3a2a]/[.18]" />
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
        >
          {/* contorno de la solapa: gira con ella al abrir */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
            <polyline points="0,0 50,62 100,0" fill="none" stroke="rgba(90,58,42,.32)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* Sello de lacre granate */}
        <button
          onClick={handleSealClick}
          aria-label="Abrir invitación"
          className={`absolute left-1/2 top-[62%] z-[4] h-[21%] w-[23%] max-h-[104px] max-w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 hover:scale-105 ${
            isOpening ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <img
            src="/sello-verso.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,.35)]"
          />
        </button>
      </div>

      <p className="relative animate-pulse rounded-full bg-[#f6f1e4]/90 px-4 py-1.5 text-center font-medium uppercase tracking-[.22em] text-[#5c4a3e] shadow-[0_2px_10px_-4px_rgba(20,28,50,.35)] text-[clamp(10px,2.6vw,13px)] lg:px-5 lg:py-2 lg:text-[15px]">
        Toca el sello para abrir
      </p>
    </div>
  );
}
