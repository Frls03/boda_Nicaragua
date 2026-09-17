import { useEffect, useState } from 'react';
import { getRsvpStatus, submitRsvp, formatDateEs } from '../lib/api';

const LOCAL_KEY = 'jj-rsvp-2027';
const token = new URLSearchParams(window.location.search).get('g');

const pill =
  'w-full rounded-full border border-[#8a7a6a]/40 bg-white/55 px-5 py-2.5 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-ink backdrop-blur-[2px] transition-colors duration-300';

export default function Rsvp() {
  const [choice, setChoice] = useState(null);
  const [guests, setGuests] = useState('2 personas');
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
      guests: choice === 'yes' ? guests : null,
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
      <h2 className="mb-5 text-center font-serif uppercase tracking-[.22em] text-[#2b3653] text-[clamp(15px,4vw,21px)] lg:text-[30px]">
        Confirma tu asistencia
      </h2>

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

        <p className="mt-2 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-[#5a4a3f]">¿Cuántas personas asistirán?</p>

        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          disabled={choice !== 'yes'}
          aria-label="Cantidad de personas"
          className={`${pill} appearance-none disabled:opacity-45`}
        >
          <option className="text-ink">1 persona</option>
          <option className="text-ink">2 personas</option>
          <option className="text-ink">3 personas</option>
          <option className="text-ink">4 personas</option>
        </select>

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
    </section>
  );
}
