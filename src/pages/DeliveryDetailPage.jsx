import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationContext'
import RenterCard from '../components/delivery/RenterCard'
import BottomNav from '../components/common/BottomNav'
import AddEquipmentModal from '../components/equipment/AddEquipmentModal'

const LOCATION_OPTIONS = [
  'In Front of House',
  'Ski Valet',
  'Slope Side Lounge',
  'Ski Room',
  'Garage',
  'Other',
]

function PropertyNotesSheet({ reservation, onSave, onClose }) {
  const [propertyName, setPropertyName] = useState(reservation.propertyName || '')
  const [address, setAddress] = useState(reservation.address || '')
  const [location, setLocation] = useState(reservation.pickupLocation || '')
  const [notes, setNotes] = useState(reservation.propertyNotes || '')

  function handleSave() {
    onSave({ propertyName, address, pickupLocation: location, propertyNotes: notes })
    onClose()
  }

  return (
    <div style={sheet.overlay}>
      <div style={sheet.sheet}>
        <div style={sheet.handle} />
        <div style={sheet.header}>
          <span style={sheet.title}>Property Notes</span>
          <button onClick={onClose} style={sheet.closeBtn}>✕</button>
        </div>

        <div style={sheet.body}>
          <label style={sheet.label}>Property Name</label>
          <input
            type="text"
            value={propertyName}
            onChange={e => setPropertyName(e.target.value)}
            placeholder="e.g. The Lodge at Beaver Creek"
            style={sheet.input}
          />

          <label style={sheet.label}>Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Street address"
            style={sheet.input}
          />

          <label style={sheet.label}>Equipment Location</label>
          <div style={sheet.optionGrid}>
            {LOCATION_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setLocation(opt)}
                style={{
                  ...sheet.optionBtn,
                  backgroundColor: location === opt ? '#FFD700' : '#2e3448',
                  color: location === opt ? '#000' : '#fff',
                  borderColor: location === opt ? '#FFD700' : '#3a4055',
                  fontWeight: location === opt ? '800' : '600',
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <label style={sheet.label}>Additional Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Gate codes, special instructions…"
            rows={3}
            style={sheet.textarea}
          />
        </div>

        <div style={sheet.footer}>
          <button onClick={handleSave} style={sheet.saveBtn}>Save Property Notes</button>
        </div>
      </div>
    </div>
  )
}

export default function DeliveryDetailPage() {
  const { reservationId } = useParams()
  const { getReservationById, updateReservation } = useReservations()
  const navigate = useNavigate()
  const [addEquipOpen, setAddEquipOpen] = useState(false)
  const [propertySheetOpen, setPropertySheetOpen] = useState(false)

  const reservation = getReservationById(reservationId)

  if (!reservation) {
    return (
      <div className="page">
        <p style={{ color: '#9aa0b4' }}>Reservation not found.</p>
        <BottomNav />
      </div>
    )
  }

  const allSigned = reservation.renters.every(r => r.waiverSigned)

  function handleRenterUpdate(renterId, changes) {
    const updatedRenters = reservation.renters.map(r =>
      r.renterId === renterId ? { ...r, ...changes } : r
    )
    updateReservation(reservationId, { renters: updatedRenters })
  }

  return (
    <div className="page" data-testid="delivery-detail-page">
      {/* Back */}
      <button onClick={() => navigate('/home')} style={styles.back} aria-label="Back">
        ← Back
      </button>

      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.neighborhood}>{reservation.neighborhood}</div>

        <div style={styles.addressRow}>
          <div style={styles.address}>{reservation.address}</div>
          <button
            onClick={() => setPropertySheetOpen(true)}
            style={styles.propNotesBtn}
            data-testid="property-notes-btn"
          >
            {reservation.propertyName ? '📋 Notes' : '+ Property Notes'}
          </button>
        </div>

        {reservation.propertyName && (
          <div style={styles.propertyName}>{reservation.propertyName}</div>
        )}
        {reservation.pickupLocation && (
          <div style={styles.locationTag}>{reservation.pickupLocation}</div>
        )}

        {reservation.customerName && (
          <div style={styles.customerName}>{reservation.customerName}</div>
        )}
        {reservation.customerPhone && (
          <a
            href="https://app.goto.com/"
            target="_blank"
            rel="noreferrer"
            style={styles.phoneLink}
            data-testid="customer-phone-link"
          >
            {reservation.customerPhone}
          </a>
        )}

        <div style={styles.meta}>
          {reservation.deliveryType && (
            <span style={styles.badge}>{reservation.deliveryType}</span>
          )}
          <span style={styles.renterCount}>
            {reservation.renters.length} renter{reservation.renters.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <button
          className="btn btn-secondary"
          data-testid="add-remove-equipment-btn"
          onClick={() => setAddEquipOpen(true)}
        >
          + Add / Remove Equipment
        </button>
        <button
          disabled={!allSigned}
          className={`btn ${allSigned ? 'btn-primary' : 'btn-disabled'}`}
          data-testid="pay-bill-btn"
          onClick={() => allSigned && navigate(`/delivery/${reservationId}/pay`)}
        >
          {allSigned ? '💳 Pay Bill' : '🔒 Pay Bill'}
        </button>
      </div>

      {/* Renter cards */}
      <div style={styles.renterList}>
        {reservation.renters.map(renter => (
          <RenterCard key={renter.renterId} renter={renter} onUpdate={handleRenterUpdate} />
        ))}
      </div>

      <AddEquipmentModal
        isOpen={addEquipOpen}
        onClose={() => setAddEquipOpen(false)}
        reservation={reservation}
        onConfirm={(renterId, addOnsToAdd) => {
          const updatedRenters = reservation.renters.map(r =>
            r.renterId === renterId
              ? { ...r, addOns: [...(r.addOns || []), ...addOnsToAdd] }
              : r
          )
          updateReservation(reservationId, { renters: updatedRenters })
        }}
        onRemove={(renterId, addOnIds) => {
          const updatedRenters = reservation.renters.map(r =>
            r.renterId === renterId
              ? { ...r, addOns: (r.addOns || []).filter(ao => !addOnIds.includes(ao.addOnId)) }
              : r
          )
          updateReservation(reservationId, { renters: updatedRenters })
        }}
      />

      {propertySheetOpen && (
        <PropertyNotesSheet
          reservation={reservation}
          onSave={changes => updateReservation(reservationId, changes)}
          onClose={() => setPropertySheetOpen(false)}
        />
      )}

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
    border: '1px solid #3a4055',
  },
  neighborhood: {
    fontSize: '12px',
    color: '#9aa0b4',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  addressRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '4px',
  },
  address: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  propNotesBtn: {
    background: 'none',
    border: '1px solid #3a4055',
    borderRadius: '6px',
    color: '#9aa0b4',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    minHeight: '28px',
    flexShrink: 0,
  },
  propertyName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: '2px',
  },
  locationTag: {
    fontSize: '12px',
    color: '#9aa0b4',
    marginBottom: '6px',
  },
  customerName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
    marginTop: '4px',
  },
  phoneLink: {
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#FFD700',
    textDecoration: 'none',
    marginBottom: '10px',
  },
  meta: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    color: '#FFD700',
    border: '1px solid #FFD700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  renterCount: {
    fontSize: '13px',
    color: '#9aa0b4',
  },
  actions: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  renterList: {
    display: 'flex',
    flexDirection: 'column',
  },
}

const sheet = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#1a1f2e',
    borderRadius: '20px 20px 0 0',
    border: '1px solid #3a4055',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
  },
  handle: {
    width: '40px',
    height: '4px',
    backgroundColor: '#3a4055',
    borderRadius: '2px',
    margin: '12px auto 0',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px 12px',
    flexShrink: 0,
  },
  title: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#9aa0b4',
    fontSize: '20px',
    cursor: 'pointer',
    minHeight: '44px',
    minWidth: '44px',
  },
  body: {
    overflowY: 'auto',
    padding: '0 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#9aa0b4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '10px',
  },
  input: {
    minHeight: '48px',
    fontSize: '16px',
    backgroundColor: '#242938',
    border: '1px solid #3a4055',
    borderRadius: '10px',
    color: '#fff',
    padding: '12px 14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '4px',
  },
  optionBtn: {
    minHeight: '48px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '10px 8px',
  },
  textarea: {
    fontSize: '15px',
    backgroundColor: '#242938',
    border: '1px solid #3a4055',
    borderRadius: '10px',
    color: '#fff',
    padding: '12px 14px',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px',
  },
  footer: {
    padding: '16px 20px',
    flexShrink: 0,
  },
  saveBtn: {
    width: '100%',
    minHeight: '52px',
    backgroundColor: '#FFD700',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '800',
    color: '#000',
    cursor: 'pointer',
  },
}
