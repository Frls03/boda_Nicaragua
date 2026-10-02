import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  assignGuestToSeats,
  createTable,
  deleteTableFromList,
  deleteTableRemote,
  fetchGuests,
  fetchTables,
  saveGuests,
  saveTables,
  updateTableInList,
} from '../data/wedding'
import { CheckCircle, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react'
import './TablesTab.css'

const POOL_ID = '__pool__'
const TABLE_SIZE = 260
const SEAT_RADIUS = 97
const SEAT_W = 52
const SEAT_H = 26

const PALETTE = [
  { bg: '#fde8e0', border: '#e8a28c', text: '#7a2010' },
  { bg: '#e8f0fe', border: '#93b4f5', text: '#1a3a7a' },
  { bg: '#e8f5e9', border: '#7ec89e', text: '#1b5e20' },
  { bg: '#fce4ec', border: '#f48fb1', text: '#7a1030' },
  { bg: '#fff8e1', border: '#ffd54f', text: '#7a5000' },
  { bg: '#f3e5f5', border: '#ce93d8', text: '#4a1060' },
  { bg: '#e0f7fa', border: '#80deea', text: '#005060' },
  { bg: '#fff3e0', border: '#ffb74d', text: '#7a3500' },
]

function guestColor(guestId) {
  let h = 0
  for (const c of guestId) h = (h * 31 + c.charCodeAt(0)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}

function getSeatStyle(index, total) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const cx = TABLE_SIZE / 2, cy = TABLE_SIZE / 2
  return {
    position: 'absolute',
    left: cx + SEAT_RADIUS * Math.cos(angle) - SEAT_W / 2,
    top:  cy + SEAT_RADIUS * Math.sin(angle) - SEAT_H / 2,
    width: SEAT_W, height: SEAT_H,
  }
}

// ─── Draggable guest ──────────────────────────────────────────────────────────
function DraggableGuest({ guest, variant = 'seat' }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: guest.id })
  const moveStyle = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined
  const col = guestColor(guest.id)

  if (variant === 'pool') {
    return (
      <div
        ref={setNodeRef}
        style={{ ...moveStyle, background: col.bg, borderColor: col.border, color: col.text }}
        className={`tt-pool-chip ${isDragging ? 'tt-dragging' : ''}`}
        {...listeners} {...attributes}
      >
        <span className="tt-pool-name">{guest.fullName}</span>
        {guest.attendanceCount > 1 && <span className="tt-pool-badge">{guest.attendanceCount}p</span>}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={moveStyle}
      className={`tt-seat-guest ${isDragging ? 'tt-dragging' : ''}`}
      title={guest.fullName}
      {...listeners} {...attributes}
    >
      {guest.fullName.split(' ')[0]}
    </div>
  )
}

// ─── Seat slot ────────────────────────────────────────────────────────────────
function SeatSlot({ id, seatNum, guest, posStyle }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const col = guest ? guestColor(guest.id) : null
  // Occupied seats block incoming drops — show different style
  const isBlocked = isOver && !!guest
  const isAccepting = isOver && !guest

  return (
    <div style={posStyle}>
      <div
        ref={setNodeRef}
        className={`tt-seat ${guest ? 'occupied' : 'empty'} ${isBlocked ? 'seat-blocked' : isAccepting ? 'seat-over' : ''}`}
        style={col ? { background: col.bg, borderColor: col.border, color: col.text } : undefined}
      >
        {guest
          ? <DraggableGuest guest={guest} variant="seat" />
          : <span className="tt-seat-num">{seatNum}</span>
        }
      </div>
    </div>
  )
}

// ─── Circular table ───────────────────────────────────────────────────────────
function TableVisual({ table, guestList, onEdit, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete }) {
  const { capacity } = table
  const guestBySeat = {}
  guestList.forEach(g => { (g.seatNumbers ?? []).forEach(sn => { guestBySeat[sn] = g }) })
  const seatsUsed = Object.keys(guestBySeat).length
  const isFull = seatsUsed >= capacity

  return (
    <div className="tt-table-card">
      <div className="tt-table-card-header">
        <div className="tt-table-card-info">
          <h3 className="tt-table-card-name">{table.name}</h3>
          <p className="tt-table-card-area">{table.area}</p>
        </div>
        <div className="tt-table-card-actions">
          <span className={`tt-seat-badge ${isFull ? 'full' : ''}`}>{seatsUsed}/{capacity}</span>
          <button type="button" className="tt-icon-btn" title="Editar mesa" aria-label={`Editar ${table.name}`} onClick={() => onEdit(table)}><PencilSimple className="ic" size={16} /></button>
          <button type="button" className="tt-icon-btn danger" title="Eliminar mesa" aria-label={`Eliminar ${table.name}`} onClick={() => onDelete(table.id)}><Trash className="ic" size={16} /></button>
        </div>
      </div>

      {confirmingDelete && (
        <div className="tt-confirm-del">
          <p>¿Eliminar <strong>{table.name}</strong>? Los invitados asignados volverán al panel.</p>
          <div className="tt-confirm-del-btns">
            <button className="tt-btn-cancel" onClick={onCancelDelete}>Cancelar</button>
            <button className="tt-btn-del-confirm" onClick={onConfirmDelete}>Eliminar</button>
          </div>
        </div>
      )}

      <div className="tt-circle-wrap" style={{ width: TABLE_SIZE, height: TABLE_SIZE }}>
        <svg className="tt-lines" width={TABLE_SIZE} height={TABLE_SIZE}>
          {Array.from({ length: capacity }, (_, i) => {
            const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2
            const cx = TABLE_SIZE / 2, cy = TABLE_SIZE / 2
            return (
              <line key={i}
                x1={cx + 44 * Math.cos(angle)} y1={cy + 44 * Math.sin(angle)}
                x2={cx + SEAT_RADIUS * Math.cos(angle)} y2={cy + SEAT_RADIUS * Math.sin(angle)}
                stroke="rgba(29,36,54,0.10)" strokeWidth="1" strokeDasharray="2 3"
              />
            )
          })}
        </svg>
        <div className="tt-surface"><span>{table.name}</span></div>
        {Array.from({ length: capacity }, (_, i) => {
          const seatNum = i + 1
          const slotId = `${table.id}:${seatNum}`
          return (
            <SeatSlot key={slotId} id={slotId} seatNum={seatNum}
              guest={guestBySeat[seatNum] ?? null} posStyle={getSeatStyle(i, capacity)} />
          )
        })}
      </div>

      {guestList.length > 0 && (
        <div className="tt-table-legend">
          {guestList.map(g => {
            const col = guestColor(g.id)
            return (
              <span key={g.id} className="tt-legend-chip"
                style={{ background: col.bg, borderColor: col.border, color: col.text }}>
                {g.fullName.split(' ')[0]}
                {g.attendanceCount > 1 && <em>{g.attendanceCount}p</em>}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Table modal ──────────────────────────────────────────────────────────────
function TableModal({ mode, table, onSave, onClose }) {
  const [name, setName]         = useState(table?.name ?? '')
  const [area, setArea]         = useState(table?.area ?? '')
  const [capacity, setCapacity] = useState(String(table?.capacity ?? '8'))

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ name: name.trim(), area: area.trim(), capacity: Number(capacity) })
  }

  return (
    <div className="tt-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="tt-modal">
        <div className="tt-modal-header">
          <h2>{mode === 'add' ? 'Nueva Mesa' : 'Editar Mesa'}</h2>
          <button type="button" className="tt-modal-close" onClick={onClose} aria-label="Cerrar"><X className="ic" size={18} /></button>
        </div>
        <form className="tt-modal-body" onSubmit={handleSubmit}>
          <div className="tt-form-field">
            <label>Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Mesa Principal" required autoFocus />
          </div>
          <div className="tt-form-field">
            <label>Zona / Área</label>
            <input type="text" value={area} onChange={e => setArea(e.target.value)}
              placeholder="Familia, Amigos, VIP…" />
          </div>
          <div className="tt-form-field">
            <label>Capacidad de sillas</label>
            <input type="number" value={capacity} min="2" max="30"
              onChange={e => setCapacity(e.target.value)} required />
          </div>
          <div className="tt-modal-actions">
            <button type="button" className="tt-btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="tt-btn-save">
              {mode === 'add' ? 'Agregar mesa' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Droppable pool ───────────────────────────────────────────────────────────
function DroppablePool({ children }) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL_ID })
  return (
    <div ref={setNodeRef} className={`tt-pool ${isOver ? 'pool-over' : ''}`}>
      {children}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TablesTab() {
  const [guests, setGuests]       = useState([])
  const [tables, setTables]       = useState([])
  const [active, setActive]       = useState(null)
  const [modal, setModal]         = useState(null)   // null | { mode, table }
  const [confirmDel, setConfirmDel] = useState(null) // table id | null

  useEffect(() => {
    fetchGuests().then(setGuests)
    fetchTables().then(setTables)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 180, tolerance: 6 } })
  )

  const confirmed  = guests.filter(g => g.attendance === 'confirmed')
  const unassigned = confirmed.filter(g => !g.tableId || !(g.seatNumbers ?? []).length)
  const tableSummary = tables.map(t => ({
    ...t,
    guests: confirmed.filter(g => g.tableId === t.id && (g.seatNumbers ?? []).length),
  }))
  const totalPersons = confirmed.reduce((s, g) => s + g.attendanceCount, 0)

  // ── Drag handlers ────────────────────────────────────────────────────────
  function handleDragStart({ active: a }) {
    setActive(guests.find(g => g.id === a.id) ?? null)
  }

  function handleDragEnd({ active: a, over }) {
    setActive(null)
    if (!over) return
    const guestId = String(a.id)
    let tableId = '', startSeat = null
    if (over.id !== POOL_ID) {
      const [tId, sNum] = String(over.id).split(':')
      tableId = tId; startSeat = Number(sNum)
    }
    const updated = assignGuestToSeats(guests, guestId, tableId, startSeat, tables)
    setGuests(updated); saveGuests(updated)
  }

  // ── Table CRUD ───────────────────────────────────────────────────────────
  function handleSaveTable(formData) {
    let nextTables

    if (modal.mode === 'add') {
      nextTables = [...tables, createTable(formData)]
    } else {
      const tableId = modal.table.id
      const newCap  = Math.max(2, Math.min(30, Number(formData.capacity) || modal.table.capacity))
      nextTables = updateTableInList(tables, tableId, { ...formData, capacity: newCap })

      // Displace guests whose seats exceed new capacity
      let changed = false
      const nextGuests = guests.map(g => {
        if (g.tableId !== tableId) return g
        const valid = (g.seatNumbers ?? []).filter(sn => sn <= newCap)
        if (valid.length !== (g.seatNumbers ?? []).length) {
          changed = true
          return { ...g, tableId: '', seatNumbers: [], updatedAt: new Date().toISOString() }
        }
        return g
      })
      if (changed) { setGuests(nextGuests); saveGuests(nextGuests) }
    }

    saveTables(nextTables); setTables(nextTables); setModal(null)
  }

  function handleDeleteTable(tableId) {
    const nextTables = deleteTableFromList(tables, tableId)
    const nextGuests = guests.map(g =>
      g.tableId === tableId ? { ...g, tableId: '', seatNumbers: [], updatedAt: new Date().toISOString() } : g
    )
    setTables(nextTables); deleteTableRemote(tableId)
    saveGuests(nextGuests); setGuests(nextGuests)
    setConfirmDel(null)
  }

  return (
    <DndContext sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="tt-root">
        <div className="tt-page-header">
          <div>
            <h2 className="adm-section-title">Mesas</h2>
            <p className="adm-section-subtitle">
              Arrastra cada invitado confirmado a la primera silla que ocupará. En el celular, mantén presionado el nombre para moverlo. Se reservan tantas sillas seguidas como personas trae.
            </p>
          </div>
          <button type="button" className="tt-btn-add-table" onClick={() => setModal({ mode: 'add', table: null })}>
            <Plus className="ic" size={16} weight="bold" />
            Nueva mesa
          </button>
        </div>

        <div className="tt-summary adm-card">
          <div className="tt-sum-item">
            <span className="tt-sum-num">{confirmed.length}</span>
            <span className="tt-sum-label">Invitaciones confirmadas</span>
          </div>
          <div className="tt-sum-sep" />
          <div className="tt-sum-item">
            <span className="tt-sum-num">{totalPersons}</span>
            <span className="tt-sum-label">Personas</span>
          </div>
          <div className="tt-sum-sep" />
          <div className="tt-sum-item">
            <span className={`tt-sum-num ${unassigned.length > 0 ? 'warn' : 'ok'}`}>
              {unassigned.length}
            </span>
            <span className="tt-sum-label">Sin silla</span>
          </div>
          <div className="tt-sum-sep" />
          <div className="tt-sum-item">
            <span className="tt-sum-num">{tables.length}</span>
            <span className="tt-sum-label">Mesas</span>
          </div>
        </div>

        <div className="tt-layout">
          <aside className="tt-sidebar">
            <div className="tt-sidebar-head">
              <h3>Sin asignar</h3>
              <span className="tt-badge-count">{unassigned.length}</span>
            </div>
            <DroppablePool>
              {unassigned.length === 0
                ? <p className="tt-pool-empty"><CheckCircle className="ic" size={18} weight="fill" /> Todos tienen silla</p>
                : unassigned.map(g => <DraggableGuest key={g.id} guest={g} variant="pool" />)
              }
            </DroppablePool>
            <p className="tt-sidebar-hint">
              Las sillas se reservan automáticamente según el número de personas de cada invitación.
            </p>
          </aside>

          <div className="tt-tables-grid">
            {tableSummary.map(t => (
              <TableVisual
                key={t.id}
                table={t}
                guestList={t.guests}
                onEdit={t => setModal({ mode: 'edit', table: t })}
                onDelete={id => setConfirmDel(id)}
                confirmingDelete={confirmDel === t.id}
                onConfirmDelete={() => handleDeleteTable(t.id)}
                onCancelDelete={() => setConfirmDel(null)}
              />
            ))}

            {/* Add table card */}
            <button className="tt-add-card" onClick={() => setModal({ mode: 'add', table: null })}>
              <span className="tt-add-icon"><Plus className="ic" size={20} /></span>
              <span>Nueva mesa</span>
            </button>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="tt-drag-ghost">
            {active.fullName.split(' ')[0]}
            {active.attendanceCount > 1 && <span> · {active.attendanceCount}p</span>}
          </div>
        ) : null}
      </DragOverlay>

      {modal && (
        <TableModal
          mode={modal.mode}
          table={modal.table}
          onSave={handleSaveTable}
          onClose={() => setModal(null)}
        />
      )}
    </DndContext>
  )
}
