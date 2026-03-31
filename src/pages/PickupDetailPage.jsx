import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationContext'
import BottomNav from '../components/common/BottomNav'

const SKI_MODELS = {
  'basic-ski': 'Rossignol Experience 76',
  'signature-ski': 'Rossignol Experience 78 CA',
  'performance-ski': 'Head Supershape i.Speed',
  'basic-snowboard': 'Burton Clash',
  'signature-snowboard': 'Burton Custom Flying V',
}

function getRentersForCategory(renters, category) {
  switch (category) {
    case 'ski':
    case 'snowboard':
      return renters.filter(r => r.packageId?.includes(category) || (!category.includes('snowboard') && !r.packageId?.includes('snowboard')))
    case 'boot':
      return renters
    case 'pole':
      return renters.filter(r => !r.packageId?.includes('snowboard'))
    case 'helmet':
      return renters.filter(r => (r.addOns || []).some(a => a.addOnId === 'helmet'))
    default:
      return renters
  }
}

export default function PickupDetailPage() {
  const { reservationId } = useParams()
  const { getReservationById, updateReservation } = useReservations()
  const navigate = useNavigate()
  const [expandedItem, setExpandedItem] = useState(null)

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
        {(reservation.checklistItems || []).map(item => {
          const isExpanded = expandedItem === item.itemId
          const relatedRenters = getRentersForCategory(reservation.renters || [], item.category)
          return (
            <div
              key={item.itemId}
              style={{
                ...styles.checklistCard,
                backgroundColor: item.checked ? 'rgba(34,197,94,0.1)' : '#242938',
                borderColor: item.checked ? '#22c55e' : '#3a4055',
              }}
              data-testid={`checklist-item-${item.itemId}`}
              data-checked={item.checked}
            >
              {/* Row */}
              <div style={styles.checklistRow}>
                <button
                  onClick={() => toggleChecklistItem(item.itemId)}
                  style={styles.checkboxBtn}
                  aria-label={`Toggle ${item.label}`}
                >
                  <span style={{ fontSize: '22px', color: item.checked ? '#22c55e' : '#9aa0b4' }}>
                    {item.checked ? '✅' : '⬜'}
                  </span>
                </button>
                <span style={{
                  ...styles.itemLabel,
                  flex: 1,
                  color: item.checked ? '#22c55e' : '#fff',
                  textDecoration: item.checked ? 'line-through' : 'none',
                }}>
                  {item.label}
                </span>
                {relatedRenters.length > 0 && (
                  <button
                    onClick={() => setExpandedItem(isExpanded ? null : item.itemId)}
                    style={styles.expandBtn}
                    aria-label="Show equipment details"
                  >
                    <span style={{ ...styles.chevron, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {isExpanded && relatedRenters.length > 0 && (
                <div style={styles.dropdown}>
                  {relatedRenters.map(renter => (
                    <div key={renter.renterId} style={styles.dropdownRow}>
                      <div style={styles.renterName}>{renter.name}</div>
                      <div style={styles.equipDetails}>
                        {item.category === 'ski' || item.category === 'snowboard' ? (
                          <>
                            <span style={styles.equipType}>{renter.skiModel || SKI_MODELS[renter.packageId] || renter.packageName}</span>
                            <span style={styles.invNum}>#{renter.inventoryNumber || '—'}</span>
                          </>
                        ) : item.category === 'boot' ? (
                          <>
                            <span style={styles.equipType}>Size {renter.bootSize || renter.selectedBootSize || '—'}</span>
                            <span style={styles.invNum}>#{renter.inventoryNumber || '—'}</span>
                          </>
                        ) : item.category === 'pole' ? (
                          <>
                            <span style={styles.equipType}>{renter.poleLength || '—'}</span>
                            <span style={styles.invNum}>#{renter.inventoryNumber || '—'}</span>
                          </>
                        ) : item.category === 'helmet' ? (
                          <>
                            <span style={styles.equipType}>
                              Size {(renter.addOns || []).find(a => a.addOnId === 'helmet')?.size || '—'}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
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
  checklistCard: {
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '8px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  checklistRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px 10px 8px',
    minHeight: '56px',
  },
  checkboxBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    minHeight: '48px',
    minWidth: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: '16px',
    fontWeight: '600',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    minHeight: '48px',
    minWidth: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chevron: {
    fontSize: '24px',
    color: '#9aa0b4',
    transition: 'transform 0.2s',
    display: 'inline-block',
  },
  dropdown: {
    borderTop: '1px solid #3a4055',
    padding: '8px 0 4px',
  },
  dropdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    borderBottom: '1px solid #2e3448',
  },
  renterName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  equipDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  equipType: {
    fontSize: '13px',
    color: '#9aa0b4',
    fontWeight: '600',
  },
  invNum: {
    fontSize: '13px',
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: '1px',
  },
}
