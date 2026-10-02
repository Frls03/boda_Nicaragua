import { useEffect, useState } from 'react'
import { ChartDonut, SignOut, UsersThree, Armchair } from '@phosphor-icons/react'
import AdminGate from './AdminGate'
import GuestsTab from './GuestsTab'
import DashboardTab from './DashboardTab'
import TablesTab from './TablesTab'
import Monogram from '../components/Monogram'
import { coupleName, logoutAdmin, readAdminSession } from '../data/wedding'
import './theme.css'
import './Admin.css'

const TABS = [
  { id: 'guests',    label: 'Invitados',  Icon: UsersThree },
  { id: 'dashboard', label: 'Respuestas', Icon: ChartDonut },
  { id: 'tables',    label: 'Mesas',      Icon: Armchair },
]

function AdminPanel() {
  const [isAuth, setIsAuth]       = useState(null) // null = checking session
  const [activeTab, setActiveTab] = useState('guests')

  useEffect(() => {
    document.title = `${coupleName} | Admin`
    readAdminSession()
      .then(session => setIsAuth(!!session))
      .catch(() => setIsAuth(false))
  }, [])

  function handleAuthenticated() {
    setIsAuth(true)
  }

  async function handleLogout() {
    await logoutAdmin()
    setIsAuth(false)
  }

  function handleTabChange(id) {
    setActiveTab(id)
    window.scrollTo(0, 0)
  }

  if (isAuth === null) return null
  if (!isAuth) {
    return (
      <div className="adm-theme">
        <AdminGate onAuthenticated={handleAuthenticated} />
      </div>
    )
  }

  return (
    <div className="adm-theme adm-layout">

      {/* ── Barra lateral (tablet y escritorio) ─────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <span className="adm-brand-mark" aria-hidden="true">
            <Monogram className="adm-brand-svg" />
          </span>
          <div className="adm-brand-text">
            <p className="adm-brand-names">{coupleName}</p>
            <p className="adm-brand-date tnum">17 de abril de 2027</p>
          </div>
        </div>

        <nav className="adm-nav" aria-label="Secciones del panel">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`adm-nav-item ${activeTab === id ? 'active' : ''}`}
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => handleTabChange(id)}
            >
              <Icon className="ic" size={20} weight={activeTab === id ? 'fill' : 'regular'} />
              {label}
            </button>
          ))}
        </nav>

        <button type="button" className="adm-logout-btn" onClick={handleLogout}>
          <SignOut className="ic" size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* ── Barra superior (celular) ─────────────────────────────────────── */}
      <header className="adm-mobile-bar">
        <span className="adm-brand-mark adm-brand-mark--sm" aria-hidden="true">
          <Monogram className="adm-brand-svg" />
        </span>
        <span className="adm-mobile-title">{coupleName}</span>
        <button type="button" className="adm-icon-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          <SignOut className="ic" size={20} />
        </button>
      </header>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <main className="adm-main">
        {activeTab === 'guests'    && <GuestsTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'tables'    && <TablesTab />}
      </main>

      {/* ── Pestañas al pulgar (celular) ─────────────────────────────────── */}
      <nav className="adm-tabbar" aria-label="Secciones del panel">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`adm-tab ${activeTab === id ? 'active' : ''}`}
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => handleTabChange(id)}
          >
            <Icon className="ic" size={22} weight={activeTab === id ? 'fill' : 'regular'} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default AdminPanel
