// Login del admin. Logica de PasswordGate (webapp_bodanica) en modo "admin";
// el modo invitado vive en components/GuestGate.jsx con el estilo de la invitacion.
import { useState } from 'react'
import { Eye, EyeSlash, LockSimple } from '@phosphor-icons/react'
import Monogram from '../components/Monogram'
import { coupleName, loginAdmin } from '../data/wedding'
import './AdminGate.css'

function AdminGate({ onAuthenticated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginAdmin(username.trim(), password.trim())
      onAuthenticated()
      setUsername('')
      setPassword('')
    } catch (err) {
      setError(err.message?.includes('VITE_SUPABASE') ? err.message : 'Correo o contraseña incorrectos.')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gate-shell">
      <div className="gate-card">
        <div className="gate-header">
          <span className="gate-mark" aria-hidden="true">
            <Monogram className="gate-mark-svg" />
          </span>
          <h1 className="gate-title">{coupleName}</h1>
          <p className="gate-subtitle">Panel de los novios para la lista, las respuestas y las mesas.</p>
        </div>

        <form onSubmit={handleSubmit} className="gate-form">
          <div className="gate-field">
            <label className="gate-label" htmlFor="gate-user">Correo</label>
            <input
              id="gate-user"
              type="email"
              className="gate-input"
              placeholder="nombre@correo.com"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="gate-field">
            <label className="gate-label" htmlFor="gate-pwd">Contraseña</label>
            <div className="gate-input-row">
              <input
                id="gate-pwd"
                type={showPwd ? 'text' : 'password'}
                className="gate-input"
                placeholder="Tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'gate-error' : undefined}
                required
              />
              <button
                type="button"
                className="gate-toggle-pwd"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPwd ? <EyeSlash className="ic" size={18} /> : <Eye className="ic" size={18} />}
              </button>
            </div>
          </div>

          {error && <p id="gate-error" className="gate-error" role="alert">{error}</p>}

          <button type="submit" className="gate-submit" disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar al panel'}
          </button>
        </form>

        <p className="gate-hint">
          <LockSimple className="ic" size={14} />
          Solo los novios y quienes coordinan el evento tienen acceso.
        </p>
      </div>
    </div>
  )
}

export default AdminGate
