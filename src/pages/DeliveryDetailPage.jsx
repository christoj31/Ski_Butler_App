import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationContext'
import RenterCard from '../components/delivery/RenterCard'
import BottomNav from '../components/common/BottomNav'
import AddEquipmentModal from '../components/equipment/AddEquipmentModal'

export default function DeliveryDetailPage() {
  const { reservationId } = useParams()
  const { getReservationById, updateReservation } = useReservations()
  const navigate = useNavigate()
  const [addEquipOpen, setAddEquipOpen] = useState(false)

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
        <div style={styles.address}>{reservation.address}</div>
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
          style={{ marginBottom: '8px' }}
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
          <RenterCard
            key={renter.renterId}
            renter={renter}
            onUpdate={handleRenterUpdate}
          />
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
      />

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
  address: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
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
