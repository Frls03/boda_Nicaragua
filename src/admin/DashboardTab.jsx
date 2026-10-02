import { useEffect, useMemo, useState } from 'react'
import { ChatCircleText, Tray } from '@phosphor-icons/react'
import { buildStats, fetchGuests, formatDate } from '../data/wedding'
import './DashboardTab.css'

const STATUS_FILTER = [
  { key: 'all',       label: 'Todos'       },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'pending',   label: 'Pendientes'  },
  { key: 'declined',  label: 'No asistirán'},
]

const STATUS_LABEL = {
  confirmed: 'Confirmado',
  pending:   'Pendiente',
  declined:  'No asistirá',
}

function DashboardTab() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const stats = useMemo(() => buildStats(guests), [guests])

  useEffect(() => {
    fetchGuests().then(setGuests).finally(() => setLoading(false))
  }, [])

  const pctConfirmed = stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0
  const pctDeclined  = stats.total ? Math.round((stats.declined  / stats.total) * 100) : 0
  const pctPending   = stats.total ? Math.round((stats.pending   / stats.total) * 100) : 0
  const answered     = stats.confirmed + stats.declined

  const segments = [
    { key: 'confirmed', label: 'Confirmados',  value: stats.confirmed, pct: pctConfirmed },
    { key: 'pending',   label: 'Pendientes',   value: stats.pending,   pct: pctPending   },
    { key: 'declined',  label: 'No asistirán', value: stats.declined,  pct: pctDeclined  },
  ]

  const visible = guests.filter(g =>
    filter === 'all' || g.attendance === filter
  )

  return (
    <div className="dt-root">
      <div>
        <h2 className="adm-section-title">Respuestas</h2>
        <p className="adm-section-subtitle">Cómo van las confirmaciones de tus invitados.</p>
      </div>

      {/* ── Resumen: una barra con las tres respuestas ──────────────────── */}
      <section className="adm-card dt-summary" aria-label="Resumen de respuestas" aria-busy={loading}>
        <div className="dt-headline">
          <p className="dt-big tnum">{stats.totalAttendees}</p>
          <div>
            <p className="dt-big-label">
              {stats.totalAttendees === 1 ? 'persona confirmada' : 'personas confirmadas'}
            </p>
            <p className="dt-big-sub tnum">
              {answered} de {stats.total} invitaciones ya respondieron
            </p>
          </div>
        </div>

        <div
          className="dt-bar"
          role="img"
          aria-label={`Confirmados ${pctConfirmed}%, pendientes ${pctPending}%, no asistirán ${pctDeclined}%`}
        >
          {stats.total === 0 ? (
            <span className="dt-bar-empty" />
          ) : (
            segments.map(s => s.value > 0 && (
              <span key={s.key} className={`dt-bar-seg dt-seg-${s.key}`} style={{ flexGrow: s.value }} />
            ))
          )}
        </div>

        <dl className="dt-legend">
          {segments.map(s => (
            <div key={s.key} className="dt-legend-item">
              <dt>
                <span className={`gt-dot gt-dot-${s.key}`} aria-hidden="true" />
                {s.label}
              </dt>
              <dd className="tnum">
                <strong>{s.value}</strong>
                <span>{s.pct}%</span>
              </dd>
            </div>
          ))}
          <div className="dt-legend-item dt-legend-total">
            <dt>Invitaciones</dt>
            <dd className="tnum"><strong>{stats.total}</strong></dd>
          </div>
        </dl>
      </section>

      {/* ── Detalle por invitado ─────────────────────────────────────────── */}
      <section className="dt-list" aria-label="Detalle por invitado">
        <div className="dt-list-header">
          <h3 className="dt-list-title">Detalle por invitado</h3>
          <div className="dt-filter-tabs" role="group" aria-label="Filtrar por estado">
            {STATUS_FILTER.map(f => (
              <button
                key={f.key}
                type="button"
                className={`dt-filter-tab ${filter === f.key ? 'active' : ''}`}
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className="dt-tab-count tnum">
                  {f.key === 'all'
                    ? guests.length
                    : guests.filter(g => g.attendance === f.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="adm-card dt-guest-list">
          {visible.length === 0 && (
            <div className="dt-empty">
              <Tray className="ic" size={28} />
              <p>{loading ? 'Cargando respuestas…' : 'No hay invitados en este estado.'}</p>
            </div>
          )}
          {visible.map(guest => (
            <div key={guest.id} className="dt-guest-row">
              <div className="dt-guest-info">
                <p className="dt-guest-name">{guest.fullName}</p>
                <p className="dt-guest-date dt-date-mobile">{formatDate(guest.updatedAt)}</p>
                {guest.notes && (
                  <p className="dt-guest-note">
                    <ChatCircleText className="ic" size={14} />
                    {guest.notes}
                  </p>
                )}
              </div>
              <div className="dt-guest-meta">
                {guest.attendance === 'confirmed' && (
                  <span className="dt-persons tnum">
                    {guest.attendanceCount} {guest.attendanceCount === 1 ? 'persona' : 'personas'}
                  </span>
                )}
                <span className={`gt-status-badge gt-status-${guest.attendance}`}>
                  <span className={`gt-dot gt-dot-${guest.attendance}`} aria-hidden="true" />
                  {STATUS_LABEL[guest.attendance] ?? guest.attendance}
                </span>
                <span className="dt-guest-date">{formatDate(guest.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardTab
