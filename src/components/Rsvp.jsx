import { useEffect, useRef, useState } from 'react';
import { formatDate, submitRsvp } from '../data/wedding';

const pill =
  'w-full rounded-full border border-[#8a7a6a]/40 bg-white/55 px-5 py-2.5 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-ink backdrop-blur-[2px] transition-colors duration-300';

const stepBtn =
  'grid h-10 w-10 place-items-center rounded-full border border-[#8a7a6a]/40 bg-white/55 font-serif text-[22px] leading-none text-ink transition-colors duration-300 enabled:hover:border-maroon enabled:hover:text-maroon disabled:opacity-35 lg:h-14 lg:w-14 lg:text-[30px]';

const adultos = (n) => `${n} ${n === 1 ? 'adulto' : 'adultos'}`;

// RSVP del invitado identificado. El maximo de adultos viene de su fila en
// Supabase (max_attendees, lo define el admin) y submit_rsvp lo vuelve a
// validar en el servidor.
export default function Rsvp({ guest, onChangeGuest, onGuestUpdate }) {
  const maxGuests = Math.max(1, guest.maxAttendees ?? 1);
  const [choice, setChoice] = useState(
    guest.attendance === 'confirmed' ? 'yes' : guest.attendance === 'declined' ? 'no' : null
  );
  const [guests, setGuests] = useState(
    Math.min(maxGuests, guest.attendanceCount > 0 ? guest.attendanceCount : maxGuests)
  );
  const [notes, setNotes] = useState(guest.notes ?? '');
  const [editing, setEditing] = useState(guest.attendance === 'pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // true solo justo despues de enviar: anima el sello y lleva la vista al mensaje
  const [justSent, setJustSent] = useState(false);
  const thanksRef = useRef(null);

  useEffect(() => {
    if (!justSent || !thanksRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    thanksRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }, [justSent]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!choice) return;

    setError('');
    setSaving(true);
    try {
      const updated = await submitRsvp(guest, {
        attendance: choice === 'yes' ? 'confirmed' : 'declined',
        attendanceCount: choice === 'yes' ? Math.min(Math.max(guests, 1), maxGuests) : 0,
        notes: notes.trim(),
      });
      onGuestUpdate(updated);
      setEditing(false);
      setJustSent(true);
    } catch {
      setError('No se pudo enviar tu confirmación. Intenta de nuevo.');
    } finally {
      setSaving(false);
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

      <p className="mt-5 text-center text-[clamp(13px,3.2vw,15px)] text-[#5a4a3f] lg:mt-7 lg:text-[19px]">
        Invitación para
        <span className="mt-0.5 block font-serif font-semibold text-[#2b3653] text-[clamp(20px,5vw,26px)] lg:text-[34px]">
          {guest.fullName}
        </span>
        <button
          type="button"
          onClick={onChangeGuest}
          className="mt-1 text-[clamp(11px,2.8vw,13px)] underline decoration-[#8a7a6a]/50 underline-offset-4 transition-colors hover:text-maroon lg:text-[15px]"
        >
          ¿No eres tú?
        </button>
      </p>

      {/* Aviso "solo adultos": sin caja, sobre el papel. Lo hace visible el
          titulo caligrafico grande y el aire alrededor. */}
      <aside aria-label="Celebración solo para adultos" className="mx-auto mb-10 mt-9 max-w-[360px] text-center lg:mb-14 lg:mt-12 lg:max-w-[560px]">
        <h3 className="font-script leading-[1.1] text-maroon text-[clamp(38px,9.5vw,50px)] lg:text-[68px]">Solo adultos</h3>
        <p className="mx-auto mt-2 max-w-[30ch] font-serif leading-snug text-ink text-[clamp(15px,3.7vw,17px)] lg:mt-3 lg:text-[22px]">
          Con todo cariño, les informamos que nuestra celebración no incluye niños. Agradecemos su comprensión.
        </p>
      </aside>

      {!editing ? (
        <div
          ref={thanksRef}
          role="status"
          className={`rsvp-thanks relative mx-auto max-w-[400px] text-center lg:max-w-[600px] ${justSent ? 'rsvp-sealed' : ''}`}
        >
          {/* La respuesta queda "sellada" con el lacre J&J de la invitacion */}
          <img
            src={guest.attendance === 'confirmed' ? '/sello-verso.png' : '/sello-navy.png'}
            alt=""
            aria-hidden="true"
            className="rsvp-seal mx-auto w-[96px] select-none drop-shadow-[0_8px_14px_rgba(60,30,30,.35)] lg:w-[128px]"
          />

          <p className="rsvp-line mt-4 font-script leading-[1.05] text-maroon text-[clamp(42px,11vw,56px)] lg:mt-6 lg:text-[76px]">
            {guest.attendance === 'confirmed' ? '¡Gracias por confirmar!' : 'Gracias por avisarnos'}
          </p>

          {guest.attendance === 'confirmed' ? (
            <>
              <p className="rsvp-line mx-auto mt-3 max-w-[30ch] font-serif leading-snug text-ink text-[clamp(17px,4.3vw,20px)] lg:mt-4 lg:text-[26px]">
                {guest.attendanceCount > 1 ? 'Los' : 'Te'} esperamos con mucha ilusión el{' '}
                <span className="whitespace-nowrap">17 de abril</span>.
              </p>

              <div className="rsvp-line mx-auto mt-6 flex max-w-[320px] items-center gap-3 lg:mt-8 lg:max-w-[440px] lg:gap-4">
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent to-maroon/50" />
                <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-maroon/70" />
                <p className="whitespace-nowrap font-serif font-semibold uppercase tracking-[.2em] text-[#2b3653] text-[clamp(13px,3.4vw,15px)] lg:text-[19px]">
                  {adultos(guest.attendanceCount)}
                </p>
                <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-maroon/70" />
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-maroon/50" />
              </div>
            </>
          ) : (
            <p className="rsvp-line mx-auto mt-3 max-w-[30ch] font-serif leading-snug text-ink text-[clamp(17px,4.3vw,20px)] lg:mt-4 lg:text-[26px]">
              Lamentamos que no puedas acompañarnos. Te tendremos presente.
            </p>
          )}

          <p className="rsvp-line mt-4 text-[clamp(12px,3vw,14px)] text-[#6b5d50] lg:mt-5 lg:text-[17px]">
            Respuesta del {formatDate(guest.updatedAt)}
          </p>
          <button
            type="button"
            onClick={() => { setJustSent(false); setEditing(true); }}
            className="rsvp-line mx-auto mt-6 rounded-full border border-[#2b3653] bg-[#f4efe4]/70 px-8 py-2.5 text-[10px] font-medium tracking-[.2em] text-[#2b3653] transition-colors duration-300 hover:bg-[#2b3653] hover:text-cream lg:mt-8 lg:px-12 lg:py-3 lg:text-[13px]"
          >
            CAMBIAR MI RESPUESTA
          </button>
        </div>
      ) : (
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

        {maxGuests === 1 ? (
          <p className={`mt-2 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-[#5a4a3f] transition-opacity duration-300 ${choice === 'yes' ? '' : 'opacity-45'}`}>
            Tu invitación es para 1 adulto.
          </p>
        ) : (
        <>
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
        </>
        )}

        <p className="mt-2 text-center text-[clamp(13px,3.2vw,15px)] lg:text-[19px] text-[#5a4a3f]">Notas adicionales (opcional)</p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Alergias, preferencias alimenticias, etc."
          className={`${pill} min-h-[46px] lg:min-h-[70px] resize-none placeholder:text-[#8a7a6a]`}
        />

        {error && (
          <p role="alert" className="mt-2 text-center text-[clamp(13px,3.2vw,15px)] text-maroon lg:text-[17px]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!choice || saving}
          className="mx-auto mt-3 rounded-full bg-[#2b3653] px-10 py-2.5 text-[10px] lg:mt-6 lg:px-16 lg:py-4 lg:text-[13px] font-medium tracking-[.2em] text-cream transition-colors duration-300 hover:bg-maroon active:scale-[0.98] disabled:opacity-45 disabled:hover:bg-[#2b3653]"
        >
          {saving ? 'ENVIANDO…' : 'CONFIRMAR'}
        </button>
      </form>
      )}

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
