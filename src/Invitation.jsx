import { useRef, useState } from 'react';
import useInkOnView from './lib/useInkOnView';
import useRevealOnScroll from './lib/useRevealOnScroll';
import Envelope from './components/Envelope';
import Hero from './components/Hero';
import VerseCard from './components/VerseCard';
import Gallery from './components/Gallery';
import DressCode from './components/DressCode';
import Location from './components/Location';
import GiftRegistry from './components/GiftRegistry';
import Rsvp from './components/Rsvp';

// La invitacion en si. El invitado ya paso por la contrasena (Invite.jsx):
// `guest` trae su nombre y su maximo de personas para el RSVP.
export default function Invitation({ guest, skipEnvelope, onChangeGuest, onGuestUpdate }) {
  const [opened, setOpened] = useState(skipEnvelope);
  // playing: arranca la apertura cuando el sobre EMPIEZA a desvanecerse, no al
  // final; si no, la invitacion se ve quieta detras del fundido y luego parpadea
  const [playing, setPlaying] = useState(skipEnvelope);
  // momento en que se abrio el sobre: ordena la escritura de los nombres
  const [openedAt, setOpenedAt] = useState(() => (skipEnvelope ? performance.now() : null));
  const inkRef = useRef(null);
  useInkOnView(inkRef, openedAt);
  const mainRef = useRef(null);
  useRevealOnScroll(mainRef, opened);

  return (
    <div className="bg-paper min-h-screen">
      {!opened && (
        <Envelope
          onLeaving={() => { setPlaying(true); setOpenedAt(performance.now()); }}
          onOpened={() => setOpened(true)}
        />
      )}

      {/* Una sola columna, de arriba a abajo, en todos los tamanos.
          El papel cubre el ancho completo; el contenido se centra. */}
      {/* inv-play: el momento de apertura (tinta y lacre, ver index.css) corre una vez al abrir */}
      <main ref={mainRef} className={`relative w-full text-ink ${playing ? 'inv-play' : ''} ${opened ? '' : 'h-screen overflow-hidden'}`}>
        {/* --- Modulo 1: banda floral arriba --- */}
        <section className="relative">
          <div
            aria-hidden="true"
            className="floral-band absolute inset-x-0 top-0 h-[320px] lg:h-[440px]"
            style={{
              maskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
            }}
          />

          <div className="relative mx-auto flex max-w-[620px] flex-col items-center px-6 lg:max-w-[860px] xl:max-w-[980px]">
            <Hero />

            {/* Nombres y fecha: se escriben con tinta al entrar en pantalla (useInkOnView) */}
            <div ref={inkRef} className="flex flex-col items-center">
            <p className="inv-ink inv-ink-1 mt-8 text-center font-serif leading-snug text-[#5a4a3f] text-[clamp(14px,3.4vw,19px)] lg:mt-12 lg:text-[24px] xl:text-[27px]">
              Con la bendición de Dios y junto con
              <br />
              nuestras familias
            </p>

            <h1 className="inv-names mt-5 text-center font-serif font-light leading-[1.12] text-[#2b3653] text-[clamp(38px,9vw,60px)] lg:mt-8 lg:text-[92px] xl:text-[108px]">
              Jonathan
              <br />
              <span className="font-script text-[.62em] text-maroon">&amp;</span>
              <br />
              Jasmin
            </h1>

            <p className="inv-ink inv-ink-2 mt-6 text-center font-serif leading-snug text-[#5a4a3f] text-[clamp(14px,3.4vw,19px)] lg:mt-10 lg:text-[24px] xl:text-[27px]">
              Nos complace invitarlos a la
              <br />
              celebración de nuestro matrimonio
              <br />
              que se celebra el día
            </p>

            <p className="inv-date mt-5 text-center font-serif font-light tracking-[.12em] text-[#2b3653] text-[clamp(28px,6.5vw,44px)] lg:mt-9 lg:text-[62px] xl:text-[72px]">
              17 | 04 | 2027
            </p>
            </div>
          </div>
        </section>

        <div data-reveal="0">
          <VerseCard />
        </div>

        {/* --- Modulo 2: galeria y tarjetas, banda floral al pie --- */}
        <section className="relative mt-16 lg:mt-24">
          <div
            aria-hidden="true"
            className="floral-band absolute inset-x-0 bottom-0 h-[360px] lg:h-[480px]"
            style={{
              maskImage: 'linear-gradient(to top, #000 0%, #000 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 40%, transparent 100%)',
            }}
          />

          <div className="relative mx-auto max-w-[620px] px-6 pb-16 lg:max-w-[860px] lg:pb-24 xl:max-w-[980px]">
            <Gallery />
            <div data-reveal="0">
              <DressCode />
              <Location />
            </div>
            <div data-reveal="0">
              <GiftRegistry />
            </div>
            <Rsvp guest={guest} onChangeGuest={onChangeGuest} onGuestUpdate={onGuestUpdate} />
          </div>
        </section>
      </main>
    </div>
  );
}
