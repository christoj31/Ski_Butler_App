import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReservations } from '../context/ReservationContext'
import ShiftToggle from '../components/route/ShiftToggle'
import DeliveryBadge from '../components/route/DeliveryBadge'
import BottomNav from '../components/common/BottomNav'

export default function TechHomePage() {
  const currentHour = new Date().getHours()
  const activeShift = currentHour >= 14 ? 'PM' : 'AM'
  const [shift, setShift] = useState(activeShift)
  const { currentUser } = useAuth()
  const { getRouteStops } = useReservations()
  const navigate = useNavigate()

  const today = new Date().toISOString().slice(0, 10)
  const stops = getRouteStops(shift, today)

  const dateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="page" data-testid="tech-home-page">
      {/* Header */}
      <header style={styles.header}>
        <div>
          <div style={styles.techName}>{currentUser?.username || 'Tech'}</div>
          <div style={styles.date}>{dateDisplay}</div>
        </div>
        <div style={styles.logoSmall}>⛷️</div>
      </header>

      {/* Shift Toggle */}
      <ShiftToggle shift={shift} onChange={setShift} activeShift={activeShift} />

      {/* Timeline grid */}
      <div style={styles.timeline} data-testid="route-list">
        {stops.length === 0 ? (
          <div style={styles.empty}>No stops for {shift} shift</div>
        ) : (
          stops.map((stop, idx) => {
            const isPickup = stop.type === 'pickup'
            const isLast = idx === stops.length - 1

            return (
              <div key={stop.reservationId} style={styles.timelineRow}>
                {/* Time column */}
                <div style={styles.timeCol}>
                  <span style={styles.timeLabel}>{stop.deliveryTime || '—'}</span>
                  {/* Vertical connector line */}
                  {!isLast && <div style={styles.connector} />}
                </div>

                {/* Dot */}
                <div style={styles.dotCol}>
                  <div style={{
                    ...styles.dot,
                    backgroundColor: isPickup ? '#22c55e' : '#FFD700',
                    boxShadow: isPickup
                      ? '0 0 0 3px rgba(34,197,94,0.2)'
                      : '0 0 0 3px rgba(255,215,0,0.2)',
                  }} />
                  {!isLast && <div style={styles.dotLine} />}
                </div>

                {/* Card */}
                <div
                  role="button"
                  tabIndex={0}
                  data-testid="route-card"
                  data-type={stop.type}
                  onClick={() => navigate(isPickup ? `/pickup/${stop.reservationId}` : `/delivery/${stop.reservationId}`)}
                  onKeyDown={e => e.key === 'Enter' && navigate(isPickup ? `/pickup/${stop.reservationId}` : `/delivery/${stop.reservationId}`)}
                  style={{
                    ...styles.card,
                    backgroundColor: isPickup ? '#1f2a1f' : '#242938',
                    borderColor: isPickup ? '#22c55e' : '#3a4055',
                    marginBottom: isLast ? 0 : '12px',
                  }}
                >
                  {/* Card top row: badge + neighborhood */}
                  <div style={styles.cardTopRow}>
                    {isPickup ? (
                      <span style={styles.pickupLabel}>PICKUP</span>
                    ) : (
                      <DeliveryBadge type={stop.deliveryType} />
                    )}
                    <span style={styles.stopNum}>#{stop.stopNumber}</span>
                    <span style={styles.neighborhood}>{stop.neighborhood}</span>
                  </div>

                  {/* Names */}
                  <div style={styles.names}>
                    {stop.renters.map(r => r.name).join(', ')}
                  </div>

                  {/* Address */}
                  <div style={styles.address}>{stop.address}</div>

                  {/* Footer row */}
                  <div style={styles.cardFooter}>
                    {!isPickup && (
                      <span style={styles.renterCount}>
                        👤 {stop.renters.length} renter{stop.renters.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={styles.chevron}>›</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingTop: '8px',
  },
  techName: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
  },
  date: {
    fontSize: '14px',
    color: '#9aa0b4',
    marginTop: '2px',
  },
  logoSmall: {
    fontSize: '32px',
  },
  empty: {
    textAlign: 'center',
    color: '#9aa0b4',
    padding: '40px 0',
    fontSize: '16px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
  },
  timelineRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
  },
  timeCol: {
    width: '72px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingRight: '10px',
    paddingTop: '14px',
  },
  timeLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  connector: {
    flex: 1,
    width: '2px',
    backgroundColor: 'transparent',
    marginTop: '6px',
  },
  dotCol: {
    width: '20px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '16px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotLine: {
    flex: 1,
    width: '2px',
    backgroundColor: '#3a4055',
    minHeight: '20px',
    marginTop: '4px',
  },
  card: {
    flex: 1,
    borderRadius: '12px',
    border: '1px solid',
    padding: '14px',
    cursor: 'pointer',
    marginLeft: '10px',
    marginBottom: '12px',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '6px',
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
  stopNum: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#FFD700',
  },
  neighborhood: {
    fontSize: '11px',
    color: '#9aa0b4',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginLeft: 'auto',
  },
  names: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '3px',
  },
  address: {
    fontSize: '13px',
    color: '#9aa0b4',
    marginBottom: '8px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  renterCount: {
    fontSize: '13px',
    color: '#9aa0b4',
  },
  chevron: {
    fontSize: '22px',
    color: '#3a4055',
    marginLeft: 'auto',
  },
}
