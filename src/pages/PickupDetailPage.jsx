import { useParams, useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationContext'
import BottomNav from '../components/common/BottomNav'

export default function PickupDetailPage() {
  const { reservationId } = useParams()
  const { getReservationById, updateReservation } = useReservations()
  const navigate = useNavigate()

  const reservation = getReservationById(reservationId)

  if (!reservation) {
    return (
      <div className="page">
        <p style={{ color: '#9aa0b4' }}>Reservation not found.</p>
        <BottomNav />
      </div>
    )
  }

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(reservation.address)}`

  function handleNoteBlur(e) {
    updateReservation(reservationId, { pickupNote: e.target.value })
  }

  function toggleChecklistItem(itemId) {
    const updatedItems = (reservation.checklistItems || []).map(item =>
      item.itemId === itemId ? { ...item, checked: !item.checked } : item
    )
    updateReservation(reservationId, { checklistItems: updatedItems })
  }

  return (
    <div className="page" data-testid="pickup-detail-page">
      <button
        onClick={() => navigate('/home')}
        style={styles.back}
        aria-label="Back"
      >
        ← Back
      </button>

      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.neighborhood}>{reservation.neighborhood}</div>
        <div style={styles.address} data-testid="pickup-address">{reservation.address}</div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.mapsBtn}
          data-testid="maps-link"
        >
          📍 Open in Google Maps
        </a>
      </div>

      {/* Pickup Notes */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Pickup Notes</h3>
        <textarea
          defaultValue={reservation.pickupNote || ''}
          onBlur={handleNoteBlur}
          placeholder="Add pickup notes…"
          style={styles.notesInput}
          data-testid="pickup-notes-textarea"
          rows={3}
        />
      </div>

      {/* Checklist */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Equipment Checklist</h3>
        {(reservation.checklistItems || []).map(item => (
          <button
            key={item.itemId}
            onClick={() => toggleChecklistItem(item.itemId)}
            data-testid={`checklist-item-${item.itemId}`}
            data-checked={item.checked}
            style={{
              ...styles.checklistItem,
              backgroundColor: item.checked ? 'rgba(34,197,94,0.1)' : '#242938',
              borderColor: item.checked ? '#22c55e' : '#3a4055',
            }}
          >
            <span style={{
              ...styles.checkbox,
              color: item.checked ? '#22c55e' : '#9aa0b4',
            }}>
              {item.checked ? '✅' : '⬜'}
            </span>
            <span style={{
              ...styles.itemLabel,
              color: item.checked ? '#22c55e' : '#fff',
              textDecoration: item.checked ? 'line-through' : 'none',
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}

const styles = {
  back: {
    background: 'none',
    border: 'none',
    color: '#FFD700',
    fontSize: '16px',
    fontWeight: '600',
    padding: '8px 0',
    marginBottom: '12px',
    cursor: 'pointer',
    minHeight: '48px',
    textAlign: 'left',
  },
  headerCard: {
    backgroundColor: '#242938',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #22c55e',
    borderLeft: '4px solid #22c55e',
  },
  neighborhood: {
    fontSize: '12px',
    color: '#9aa0b4',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  address: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '14px',
  },
  mapsBtn: {
    display: 'block',
    backgroundColor: '#1a2e1a',
    color: '#22c55e',
    border: '1px solid #22c55e',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '15px',
    fontWeight: '700',
    textDecoration: 'none',
    textAlign: 'center',
    minHeight: '48px',
    lineHeight: '24px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    color: '#9aa0b4',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  notesInput: {
    minHeight: '80px',
    resize: 'vertical',
  },
  checklistItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '8px',
    cursor: 'pointer',
    minHeight: '56px',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  checkbox: {
    fontSize: '22px',
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: '16px',
    fontWeight: '600',
  },
}
