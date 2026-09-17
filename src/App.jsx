import { useState } from 'react';
import Envelope from './components/Envelope';
import Hero from './components/Hero';
import VerseCard from './components/VerseCard';
import Gallery from './components/Gallery';
import DressCode from './components/DressCode';
import Location from './components/Location';
import Rsvp from './components/Rsvp';

export default function App() {
  const [opened, setOpened] = useState(false);

  return (
    <div className="bg-paper min-h-screen">
      {!opened && <Envelope onOpened={() => setOpened(true)} />}

      {/* Una sola columna, de arriba a abajo, en todos los tamanos.
          El papel cubre el ancho completo; el contenido se centra. */}
      <main className={`relative w-full text-ink ${opened ? '' : 'h-screen overflow-hidden'}`}>
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

            <p className="mt-8 text-center font-serif leading-snug text-[#5a4a3f] text-[clamp(14px,3.4vw,19px)] lg:mt-12 lg:text-[24px] xl:text-[27px]">
              Con la bendición de Dios y junto con
              <br />
              nuestras familias
            </p>

            <h1 className="mt-5 text-center font-serif font-light leading-[1.12] text-[#2b3653] text-[clamp(38px,9vw,60px)] lg:mt-8 lg:text-[92px] xl:text-[108px]">
              Jonathan
              <br />
              <span className="font-script text-[.62em] text-maroon">&amp;</span>
              <br />
              Jasmin
            </h1>

            <p className="mt-6 text-center font-serif leading-snug text-[#5a4a3f] text-[clamp(14px,3.4vw,19px)] lg:mt-10 lg:text-[24px] xl:text-[27px]">
              Nos complace invitarlos a la
              <br />
              celebración de nuestro matrimonio
              <br />
              que se celebra el día
            </p>

            <p className="mt-5 text-center font-serif font-light tracking-[.12em] text-[#2b3653] text-[clamp(28px,6.5vw,44px)] lg:mt-9 lg:text-[62px] xl:text-[72px]">
              01 | 02 | 2027
            </p>
          </div>
        </section>

        <VerseCard />

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
            <DressCode />
            <Location />
            <Rsvp />
          </div>
        </section>
      </main>
    </div>
  );
}
