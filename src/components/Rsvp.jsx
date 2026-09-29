import { useEffect, useState } from 'react';
import { getRsvpStatus, submitRsvp, formatDateEs } from '../lib/api';

const LOCAL_KEY = 'jj-rsvp-2027';
const token = new URLSearchParams(window.location.search).get('g');
// Tope de adultos por invitacion. Cuando el backend exponga el max attendees
// de cada invitado, reemplazar este valor por el que devuelva la API.
const DEFAULT_MAX_GUESTS = 4;

// El contrato de submitRsvp espera "N persona(s)", no un numero.
const guestLabel = (n) => `${n} ${n === 1 ? 'persona' : 'personas'}`;

const pill =
  'w-full rounded-full border border-[#8a7a6a]/40 bg-white/55 px-5 py-2.5 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-ink backdrop-blur-[2px] transition-colors duration-300';

const stepBtn =
  'grid h-10 w-10 place-items-center rounded-full border border-[#8a7a6a]/40 bg-white/55 font-serif text-[22px] leading-none text-ink transition-colors duration-300 enabled:hover:border-maroon enabled:hover:text-maroon disabled:opacity-35 lg:h-14 lg:w-14 lg:text-[30px]';

export default function Rsvp() {
  const [choice, setChoice] = useState(null);
  const maxGuests = DEFAULT_MAX_GUESTS;
  const [guests, setGuests] = useState(Math.min(2, maxGuests));
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await getRsvpStatus(token);
        if (status) {
          setConfirmed(status);
          return;
        }
      } catch (err) {
        console.warn('No se pudo consultar el backend:', err.message);
      }
      const local = localStorage.getItem(LOCAL_KEY);
      if (local) setConfirmed(JSON.parse(local));
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!choice) return;

    const input = {
      token,
      attending: choice === 'yes',
      guests: choice === 'yes' ? guestLabel(guests) : null,
      notes,
    };

    try {
      const result = await submitRsvp(input);
      setConfirmed(result);
    } catch (err) {
      // ponytail: sin backend conectado todavía, se guarda local para previsualizar el flujo.
      // Definí VITE_GRAPHQL_ENDPOINT y esto pasa a llamar tu API real automáticamente.
      console.warn('GraphQL no disponible, guardando localmente:', err.message);
      const fallback = { ...input, confirmedAt: formatDateEs(new Date()) };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(fallback));
      setConfirmed(fallback);
    }
  }

  return (
    <section className="mt-12 lg:mt-20">
      <Filete />

      <h2 className="mt-8 lg:mt-12 text-center font-serif uppercase tracking-[.22em] text-[#2b3653] text-[clamp(15px,4vw,21px)] lg:text-[30px]">
        Confirma tu asistencia
      </h2>

      <p className="mx-auto mt-3 max-w-[330px] text-center leading-snug text-[#5a4a3f] text-[clamp(13px,3.2vw,15px)] lg:mt-4 lg:max-w-[520px] lg:text-[19px]">
        Agradecemos confirmar su asistencia a más tardar el{' '}
        <span className="whitespace-nowrap font-semibold text-[#2b3653]">01 de marzo del 2027</span>
      </p>

      {/* Aviso "solo adultos": sin caja, sobre el papel. Lo hace visible el
          titulo caligrafico grande y el aire alrededor. */}
      <aside aria-label="Celebración solo para adultos" className="mx-auto mb-10 mt-9 max-w-[360px] text-center lg:mb-14 lg:mt-12 lg:max-w-[560px]">
        <h3 className="font-script leading-[1.1] text-maroon text-[clamp(38px,9.5vw,50px)] lg:text-[68px]">Solo adultos</h3>
        <p className="mx-auto mt-2 max-w-[30ch] font-serif leading-snug text-ink text-[clamp(15px,3.7vw,17px)] lg:mt-3 lg:text-[22px]">
          Con todo cariño, les informamos que nuestra celebración no incluye niños. Agradecemos su comprensión.
        </p>
      </aside>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 lg:gap-4">
        <button
          type="button"
          onClick={() => setChoice('yes')}
          className={`${pill} ${choice === 'yes' ? 'border-maroon bg-white/90 text-maroon' : 'hover:bg-white/75'}`}
        >
          Sí, asistiré
        </button>

        <button
          type="button"
          onClick={() => setChoice('no')}
          className={`${pill} ${choice === 'no' ? 'border-maroon bg-white/90 text-maroon' : 'hover:bg-white/75'}`}
        >
          No podré asistir
        </button>

        <p id="rsvp-guests" className="mt-2 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-[#5a4a3f]">
          ¿Cuántos adultos asistirán?
        </p>

        {/* Contador en lugar de <select> o circulos: funciona igual con
            cualquier tope (1, 4 o 10) sin cambiar de ancho. */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${choice === 'yes' ? '' : 'opacity-45'}`}>
          <div className="flex items-center gap-6 lg:gap-9">
            <button
              type="button"
              aria-label="Uno menos"
              disabled={choice !== 'yes' || guests <= 1}
              onClick={() => setGuests((n) => Math.max(1, n - 1))}
              className={stepBtn}
            >
              −
            </button>

            <output
              aria-labelledby="rsvp-guests"
              aria-live="polite"
              className="min-w-[2ch] text-center font-serif leading-none text-maroon text-[44px] lg:text-[64px]"
            >
              {guests}
            </output>

            <button
              type="button"
              aria-label="Uno más"
              disabled={choice !== 'yes' || guests >= maxGuests}
              onClick={() => setGuests((n) => Math.min(maxGuests, n + 1))}
              className={stepBtn}
            >
              +
            </button>
          </div>

          <p className="mt-1.5 text-[clamp(12px,3vw,14px)] lg:mt-2 lg:text-[17px] text-[#5a4a3f]">
            {guests === 1 ? 'adulto' : 'adultos'} · máximo {maxGuests}
          </p>
        </div>

        <p className="mt-2 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-[#5a4a3f]">Notas adicionales (opcional)</p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Alergias, preferencias alimenticias, etc."
          className={`${pill} min-h-[46px] lg:min-h-[70px] resize-none placeholder:text-[#8a7a6a]`}
        />

        {confirmed ? (
          <p className="mt-3 text-center leading-relaxed text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-[#5a4a3f]">
            Ya confirmaste tu asistencia el
            <br />
            {confirmed.confirmedAt}
          </p>
        ) : (
          <button
            type="submit"
            disabled={!choice}
            className="mx-auto mt-3 rounded-full bg-[#2b3653] px-10 py-2.5 text-[10px] lg:mt-6 lg:px-16 lg:py-4 lg:text-[13px] font-medium tracking-[.2em] text-cream transition-colors duration-300 hover:bg-maroon disabled:opacity-45 disabled:hover:bg-[#2b3653]"
          >
            CONFIRMAR
          </button>
        )}
      </form>

      <div className="mt-8 lg:mt-12">
        <Filete />
      </div>
    </section>
  );
}

// Linea fina granate que se desvanece hacia los extremos, con un rombo al
// centro. Enmarca la confirmacion arriba y abajo sin encerrarla en una caja.
function Filete() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[360px] items-center gap-3 lg:max-w-[560px] lg:gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-maroon/60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-maroon/70 lg:h-2 lg:w-2" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-maroon/60" />
    </div>
  );
}
