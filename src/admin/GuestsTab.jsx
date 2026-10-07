import { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Check, Copy, DownloadSimple, FileXls, MagnifyingGlass, PencilSimple, Plus, Trash, UploadSimple, UsersThree, X,
} from '@phosphor-icons/react'
import {
  buildInvitationMessage,
  createGuest,
  deleteGuestFromList,
  deleteGuestRemote,
  EXCEL_TEMPLATE_HEADERS,
  fetchGuests,
  fetchTables,
  formatDate,
  parseExcelRows,
  passwordProblem,
  saveGuests,
  updateGuestInList,
} from '../data/wedding'
import './GuestsTab.css'

const EMPTY_FORM = {
  fullName: '',
  password: '',
  maxAttendees: '1',
  notes: '',
  attendance: 'pending',
}

const FILTERS = [
  { key: 'all',       label: 'Todos' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'pending',   label: 'Pendientes' },
  { key: 'declined',  label: 'No asistirán' },
]

const ATTENDANCE_LABELS = {
  confirmed: 'Confirmado',
  declined:  'No asistirá',
  pending:   'Pendiente',
}

function GuestsTab() {
  const [guests, setGuests]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')
  const [modal, setModal]           = useState(null) // null | { mode: 'add'|'edit', guest }
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formError, setFormError]   = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // guestId
  const [excelPreview, setExcelPreview]  = useState(null) // array of guests to import
  const [copiedId, setCopiedId]     = useState(null)
  const fileRef = useRef(null)

  const [tableNames, setTableNames] = useState({})

  useEffect(() => {
    fetchGuests().then(setGuests).finally(() => setLoading(false))
    // Solo lectura: mostrar el nombre de la mesa en vez de su id interno
    fetchTables()
      .then(ts => setTableNames(Object.fromEntries(ts.map(t => [t.id, t.name]))))
      .catch(() => {})
  }, [])

  async function persist(next) {
    setGuests(next)
    try {
      await saveGuests(next)
    } catch (err) {
      setFormError(`No se pudo guardar: ${err.message}`)
    }
  }

  async function handleCopyMessage(guest) {
    await navigator.clipboard.writeText(buildInvitationMessage(guest))
    setCopiedId(guest.id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // ── Filtering ────────────────────────────────────────────────────────────
  const visible = guests.filter(g => {
    const matchSearch = g.fullName.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'confirmed' && g.attendance === 'confirmed') ||
      (filter === 'pending'   && g.attendance === 'pending')   ||
      (filter === 'declined'  && g.attendance === 'declined')
    return matchSearch && matchFilter
  })

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM)
    setFormError('')
    setModal({ mode: 'add' })
  }

  function openEdit(guest) {
    setForm({
      fullName:    guest.fullName,
      password:    guest.password,
      maxAttendees: String(guest.maxAttendees),
      notes:       guest.notes ?? '',
      attendance:  guest.attendance,
    })
    setFormError('')
    setModal({ mode: 'edit', guest })
  }

  function closeModal() {
    setModal(null)
    setFormError('')
  }

  function handleFormChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    if (!form.fullName.trim()) { setFormError('El nombre es obligatorio.'); return }
    if (!form.password.trim()) { setFormError('La contraseña es obligatoria.'); return }
    const problema = passwordProblem(form.password.trim())
    if (problema) { setFormError(problema); return }

    const passwordExists = guests.some(
      g => g.password === form.password.trim() &&
           (modal.mode === 'add' || g.id !== modal.guest.id)
    )
    if (passwordExists) { setFormError('Esta contraseña ya está en uso.'); return }

    if (modal.mode === 'add') {
      persist([createGuest(form), ...guests])
    } else {
      persist(
        updateGuestInList(guests, modal.guest.id, {
          fullName:    form.fullName.trim(),
          password:    form.password.trim(),
          maxAttendees: Math.max(1, Number(form.maxAttendees) || 1),
          notes:       form.notes.trim(),
          attendance:  form.attendance,
        })
      )
    }
    closeModal()
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    setGuests(deleteGuestFromList(guests, id))
    setConfirmDelete(null)
    await deleteGuestRemote(id)
  }

  // ── Excel download template ───────────────────────────────────────────────
  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      EXCEL_TEMPLATE_HEADERS,
      ['María García', 'boda-001', '2', 'Vegetariana'],
      ['Juan Pérez',   'boda-002', '4', ''],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Invitados')
    XLSX.writeFile(wb, 'plantilla_invitados.xlsx')
  }

  // ── Excel upload ──────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const data = new Uint8Array(ev.target.result)
      const wb   = XLSX.read(data, { type: 'array' })
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)
      setExcelPreview(parseExcelRows(rows))
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  function confirmExcelImport() {
    if (!excelPreview) return
    const existingPasswords = new Set(guests.map(g => g.password))
    const validas = excelPreview.filter(g => !passwordProblem(g.password))
    const toAdd = validas.filter(g => !existingPasswords.has(g.password))
    persist([...toAdd, ...guests])
    const omitidas = excelPreview.length - toAdd.length
    if (omitidas > 0) {
      setFormError(`Se importaron ${toAdd.length}. Se omitieron ${omitidas} por contraseña repetida o inválida (6 a 64 caracteres).`)
    }
    setExcelPreview(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="gt-root" aria-busy="true" aria-label="Cargando invitados">
        <div className="gt-skeleton gt-skeleton-title" />
        <div className="adm-card gt-skeleton-card">
          {[0, 1, 2, 3, 4].map(i => <div key={i} className="gt-skeleton gt-skeleton-row" />)}
        </div>
      </div>
    )
  }

  const counts = {
    all: guests.length,
    confirmed: guests.filter(g => g.attendance === 'confirmed').length,
    pending: guests.filter(g => g.attendance === 'pending').length,
    declined: guests.filter(g => g.attendance === 'declined').length,
  }

  return (
    <div className="gt-root">
      <div className="gt-header">
        <div>
          <h2 className="adm-section-title">Invitados</h2>
          <p className="adm-section-subtitle tnum">
            {guests.length} {guests.length === 1 ? 'invitación registrada' : 'invitaciones registradas'}
          </p>
        </div>
        <div className="gt-header-actions">
          <button type="button" className="gt-btn-secondary" onClick={downloadTemplate}>
            <DownloadSimple className="ic" size={16} />
            Plantilla Excel
          </button>
          <button type="button" className="gt-btn-secondary" onClick={() => fileRef.current?.click()}>
            <UploadSimple className="ic" size={16} />
            Cargar Excel
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="gt-hidden-input"
            onChange={handleFileChange}
          />
          <button type="button" className="gt-btn-primary" onClick={openAdd}>
            <Plus className="ic" size={16} weight="bold" />
            Agregar invitado
          </button>
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div className="gt-filters">
        <label className="gt-search-wrap">
          <MagnifyingGlass className="ic gt-search-icon" size={16} />
          <span className="sr-only">Buscar por nombre</span>
          <input
            type="search"
            className="gt-search"
            placeholder="Buscar por nombre"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <div className="gt-filter-pills" role="group" aria-label="Filtrar por estado">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={`gt-filter-pill ${filter === f.key ? 'active' : ''}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.key !== 'all' && <span className={`gt-dot gt-dot-${f.key}`} aria-hidden="true" />}
              {f.label}
              <span className="gt-pill-count tnum">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Vista previa del Excel ────────────────────────────────────────── */}
      {excelPreview && (
        <div className="gt-excel-preview" role="status">
          <FileXls className="ic gt-excel-icon" size={28} />
          <div className="gt-excel-text">
            <p className="gt-excel-title">
              Encontramos <strong className="tnum">{excelPreview.length}</strong> invitados en el archivo.
            </p>
            <p className="gt-excel-sub">
              Se agregan los que no repitan una contraseña que ya exista.
            </p>
          </div>
          <div className="gt-excel-actions">
            <button type="button" className="gt-btn-ghost" onClick={() => setExcelPreview(null)}>
              Cancelar
            </button>
            <button type="button" className="gt-btn-primary" onClick={confirmExcelImport}>
              Importar
            </button>
          </div>
        </div>
      )}

      {formError && !modal && <p className="gt-form-error" role="alert">{formError}</p>}

      {/* ── Lista ─────────────────────────────────────────────────────────── */}
      <div className="adm-card gt-table-wrap">
        {visible.length === 0 ? (
          <div className="gt-empty">
            <UsersThree className="ic" size={32} />
            {guests.length === 0 ? (
              <>
                <p className="gt-empty-title">Todavía no hay invitados</p>
                <p className="gt-empty-sub">Agrégalos uno por uno o carga la plantilla de Excel con toda la lista.</p>
              </>
            ) : (
              <>
                <p className="gt-empty-title">Nadie coincide con ese filtro</p>
                <p className="gt-empty-sub">Prueba con otro nombre o cambia el estado.</p>
              </>
            )}
          </div>
        ) : (
          <table className="gt-table">
            <thead>
              <tr>
                <th>Invitado</th>
                <th>Contraseña</th>
                <th className="gt-td-center">Máx.</th>
                <th>Estado</th>
                <th>Mesa</th>
                <th>Creado</th>
                <th><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(guest => (
                <tr key={guest.id}>
                  <td className="gt-td-name" data-label="Invitado">
                    <span className="gt-name">{guest.fullName}</span>
                    {guest.notes && <span className="gt-note">{guest.notes}</span>}
                    {/* Solo celular: contraseña, máximo y mesa en una línea */}
                    <span className="gt-meta-mobile">
                      <code className="gt-password-chip">{guest.password}</code>
                      <span className="tnum">Hasta {guest.maxAttendees}</span>
                      <span>{guest.tableId ? (tableNames[guest.tableId] ?? guest.tableId) : 'Sin mesa'}</span>
                    </span>
                  </td>
                  <td data-label="Contraseña">
                    <code className="gt-password-chip">{guest.password}</code>
                  </td>
                  <td className="gt-td-center tnum" data-label="Máx.">{guest.maxAttendees}</td>
                  <td data-label="Estado">
                    <span className={`gt-status-badge gt-status-${guest.attendance}`}>
                      <span className={`gt-dot gt-dot-${guest.attendance}`} aria-hidden="true" />
                      {ATTENDANCE_LABELS[guest.attendance] ?? guest.attendance}
                      {guest.attendance === 'confirmed' && (
                        <span className="gt-status-count tnum">· {guest.attendanceCount}</span>
                      )}
                    </span>
                  </td>
                  <td className="gt-td-table" data-label="Mesa">
                    {guest.tableId ? (tableNames[guest.tableId] ?? guest.tableId) : <span className="gt-muted">Sin mesa</span>}
                  </td>
                  <td className="gt-td-date" data-label="Creado">{formatDate(guest.createdAt)}</td>
                  <td className="gt-td-actions">
                    <div className="gt-row-actions">
                      {confirmDelete === guest.id ? (
                        <>
                          <span className="gt-confirm-text">¿Eliminar?</span>
                          <button
                            type="button"
                            className="gt-action-btn confirm-del"
                            onClick={() => handleDelete(guest.id)}
                          >
                            Sí, eliminar
                          </button>
                          <button
                            type="button"
                            className="gt-action-btn cancel-del"
                            onClick={() => setConfirmDelete(null)}
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={`gt-action-btn copy ${copiedId === guest.id ? 'done' : ''}`}
                            onClick={() => handleCopyMessage(guest)}
                            aria-label="Copiar mensaje de invitación"
                            title="Copiar mensaje de invitación"
                          >
                            {copiedId === guest.id
                              ? <><Check className="ic" size={16} weight="bold" /><span className="gt-action-label">Copiado</span></>
                              : <><Copy className="ic" size={16} /><span className="gt-action-label">Copiar mensaje</span></>}
                          </button>
                          <button
                            type="button"
                            className="gt-action-btn edit"
                            onClick={() => openEdit(guest)}
                            aria-label={`Editar a ${guest.fullName}`}
                            title="Editar"
                          >
                            <PencilSimple className="ic" size={16} />
                          </button>
                          <button
                            type="button"
                            className="gt-action-btn delete"
                            onClick={() => setConfirmDelete(guest.id)}
                            aria-label={`Eliminar a ${guest.fullName}`}
                            title="Eliminar"
                          >
                            <Trash className="ic" size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Formulario ────────────────────────────────────────────────────── */}
      {modal && (
        <div className="gt-modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="gt-modal" role="dialog" aria-modal="true" aria-labelledby="gt-modal-title">
            <div className="gt-modal-header">
              <h3 id="gt-modal-title">{modal.mode === 'add' ? 'Agregar invitado' : 'Editar invitado'}</h3>
              <button type="button" className="gt-modal-close" onClick={closeModal} aria-label="Cerrar">
                <X className="ic" size={18} />
              </button>
            </div>

            <div className="gt-modal-body">
              <div className="gt-field">
                <label className="gt-label" htmlFor="gf-name">Nombre completo</label>
                <input
                  id="gf-name"
                  type="text"
                  className="gt-input"
                  value={form.fullName}
                  onChange={e => handleFormChange('fullName', e.target.value)}
                  placeholder="Ej: Familia García"
                  autoFocus
                />
              </div>

              <div className="gt-field">
                <label className="gt-label" htmlFor="gf-pwd">Contraseña de la invitación</label>
                <input
                  id="gf-pwd"
                  type="text"
                  className="gt-input gt-input-mono"
                  value={form.password}
                  onChange={e => handleFormChange('password', e.target.value)}
                  placeholder="Ej: garcia-7k2m"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <p className="gt-help">Es la que el invitado escribe para abrir su invitación. No puede repetirse.</p>
              </div>

              <div className="gt-field-row">
                <div className="gt-field">
                  <label className="gt-label" htmlFor="gf-max">Máximo de personas</label>
                  <input
                    id="gf-max"
                    type="number"
                    className="gt-input tnum"
                    min={1}
                    max={20}
                    inputMode="numeric"
                    value={form.maxAttendees}
                    onChange={e => handleFormChange('maxAttendees', e.target.value)}
                  />
                </div>

                {modal.mode === 'edit' && (
                  <div className="gt-field">
                    <label className="gt-label" htmlFor="gf-status">Estado</label>
                    <select
                      id="gf-status"
                      className="gt-input gt-select"
                      value={form.attendance}
                      onChange={e => handleFormChange('attendance', e.target.value)}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="declined">No asistirá</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="gt-field">
                <label className="gt-label" htmlFor="gf-notes">
                  Notas <span className="gt-optional">opcional</span>
                </label>
                <textarea
                  id="gf-notes"
                  className="gt-input gt-textarea"
                  rows={3}
                  value={form.notes}
                  onChange={e => handleFormChange('notes', e.target.value)}
                  placeholder="Ej: vegetariana, alergia a las nueces"
                />
              </div>

              {formError && <p className="gt-form-error" role="alert">{formError}</p>}
            </div>

            <div className="gt-modal-footer">
              <button type="button" className="gt-btn-ghost" onClick={closeModal}>Cancelar</button>
              <button type="button" className="gt-btn-primary" onClick={handleSave}>
                {modal.mode === 'add' ? 'Agregar invitado' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuestsTab
