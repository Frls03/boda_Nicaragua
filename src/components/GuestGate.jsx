import { useState } from 'react';
import { clearGuestSession, loginGuest, saveGuestSession } from '../data/wedding';

// Contrasena del invitado antes del sobre. Logica del PasswordGate de
// webapp_bodanica (modo "invite"), con el estilo de esta invitacion.
export default function GuestGate({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const guest = await loginGuest(password.trim());
      if (!guest) {
        clearGuestSession();
        setError('La contraseña no coincide con ninguna invitación.');
        return;
      }
      saveGuestSession(guest);
      onAuthenticated(guest);
      setPassword('');
    } catch (err) {
      setError(
        err.message?.includes('VITE_SUPABASE')
          ? 'La invitación todavía no está conectada. Intenta más tarde.'
          : 'No se pudo verificar la contraseña. Intenta de nuevo.'
      );
      if (err.message?.includes('VITE_SUPABASE')) console.warn(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-paper relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden="true"
        className="floral-band absolute inset-x-0 top-0 h-[320px] lg:h-[440px]"
        style={{
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%)',
        }}
      />

      <div className="relative w-full max-w-[400px] text-center lg:max-w-[480px]">
        <img
          src="/sello-navy.png"
          alt=""
          aria-hidden="true"
          className="mx-auto w-[84px] select-none drop-shadow-[0_6px_12px_rgba(20,25,45,.35)] lg:w-[104px]"
        />

        <h1 className="mt-6 font-serif font-light leading-[1.1] text-[#2b3653] text-[clamp(36px,9vw,48px)] lg:text-[60px]">
          Jonathan <span className="font-script text-[.7em] text-maroon">&amp;</span> Jasmin
        </h1>
        <p className="mt-3 font-serif tracking-[.12em] text-[#5a4a3f] text-[clamp(16px,4vw,20px)] lg:text-[24px]">
          17 | 04 | 2027
        </p>

        <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-3 lg:mt-12">
          <label htmlFor="guest-pwd" className="text-[clamp(13px,3.2vw,15px)] text-[#5a4a3f] lg:text-[18px]">
            Escribe la contraseña de tu invitación
          </label>

          <div className="relative">
            <input
              id="guest-pwd"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'guest-pwd-error' : undefined}
              className="w-full rounded-full border border-[#8a7a6a]/40 bg-white/70 py-3 pl-6 pr-[5.5rem] text-center text-[16px] text-ink backdrop-blur-[2px] transition-colors duration-300 focus:border-maroon focus:outline-none lg:py-4 lg:text-[19px]"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Ver contraseña'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[.12em] text-[#5a4a3f] transition-colors hover:text-maroon lg:text-[13px]"
            >
              {showPwd ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          {error && (
            <p id="guest-pwd-error" role="alert" className="text-[clamp(13px,3.2vw,15px)] text-maroon lg:text-[17px]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mx-auto mt-3 rounded-full bg-[#2b3653] px-10 py-3 text-[11px] font-medium tracking-[.2em] text-cream transition-colors duration-300 hover:bg-maroon active:scale-[0.98] disabled:opacity-60 lg:mt-5 lg:px-14 lg:py-4 lg:text-[13px]"
          >
            {loading ? 'VERIFICANDO…' : 'VER MI INVITACIÓN'}
          </button>
        </form>

        <p className="mt-8 text-[clamp(12px,3vw,14px)] text-[#8a7a6a] lg:text-[16px]">
          Si no tienes tu contraseña, revisa el mensaje que te enviamos.
        </p>
      </div>
    </div>
  );
}
