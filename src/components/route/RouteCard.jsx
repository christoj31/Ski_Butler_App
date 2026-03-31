import { useNavigate } from 'react-router-dom'
import DeliveryBadge from './DeliveryBadge'

export default function RouteCard({ reservation }) {
  const navigate = useNavigate()
  const isPickup = reservation.type === 'pickup'

  function handleTap() {
    if (isPickup) {
      navigate(`/pickup/${reservation.reservationId}`)
    } else {
      navigate(`/delivery/${reservation.reservationId}`)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="route-card"
      data-type={reservation.type}
      onClick={handleTap}
      onKeyDown={e => e.key === 'Enter' && handleTap()}
      style={{
        ...styles.card,
        backgroundColor: isPickup ? '#1f2a1f' : '#242938',
        borderColor: isPickup ? '#22c55e' : '#3a4055',
        borderLeftColor: isPickup ? '#22c55e' : '#FFD700',
      }}
    >
      <div style={styles.row}>
        <span style={styles.stopNumber}>#{reservation.stopNumber}</span>

        <div style={styles.info}>
          <div style={styles.topRow}>
            {isPickup ? (
              <span style={styles.pickupLabel}>PICKUP</span>
            ) : (
              <DeliveryBadge type={reservation.deliveryType} />
            )}
            <span style={styles.neighborhood}>{reservation.neighborhood}</span>
          </div>

          <div style={styles.customerNames}>
            {reservation.renters.map(r => r.name).join(', ')}
          </div>

          <div style={styles.address}>{reservation.address}</div>

          {!isPickup && (
            <div style={styles.renterCount}>
              {reservation.renters.length} renter{reservation.renters.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div style={styles.chevron}>›</div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    borderRadius: '12px',
    border: '1px solid',
    borderLeft: '4px solid',
    padding: '16px',
    marginBottom: '10px',
    cursor: 'pointer',
    minHeight: '80px',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  stopNumber: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#FFD700',
    minWidth: '36px',
    paddingTop: '2px',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pickupLabel: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    color: '#22c55e',
    border: '1px solid #22c55e',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  neighborhood: {
    fontSize: '11px',
    color: '#9aa0b4',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  customerNames: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
  },
  address: {
    fontSize: '13px',
    color: '#9aa0b4',
  },
  renterCount: {
    fontSize: '13px',
    color: '#9aa0b4',
  },
  chevron: {
    fontSize: '24px',
    color: '#3a4055',
    paddingTop: '4px',
  },
}
