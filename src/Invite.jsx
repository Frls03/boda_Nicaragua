import { useState } from 'react';
import GuestGate from './components/GuestGate';
import Invitation from './Invitation';
import { clearGuestSession, readGuestSession, saveGuestSession } from './data/wedding';

// Flujo del invitado (como Invite.jsx de webapp_bodanica):
// contrasena -> sobre -> invitacion. Si ya entro en esta pestana, va directo.
export default function Invite() {
  const [existing] = useState(readGuestSession);
  const [guest, setGuest] = useState(existing?.guest ?? null);
  const [fromSession, setFromSession] = useState(Boolean(existing?.guest));

  function handleAuthenticated(authenticatedGuest) {
    setGuest(authenticatedGuest);
    setFromSession(false); // recien entro: que abra el sobre
  }

  function handleChangeGuest() {
    clearGuestSession();
    setGuest(null);
    window.scrollTo(0, 0);
  }

  function handleGuestUpdate(updatedGuest) {
    saveGuestSession(updatedGuest);
    setGuest(updatedGuest);
  }

  if (!guest) return <GuestGate onAuthenticated={handleAuthenticated} />;

  return (
    <Invitation
      guest={guest}
      skipEnvelope={fromSession}
      onChangeGuest={handleChangeGuest}
      onGuestUpdate={handleGuestUpdate}
    />
  );
}
