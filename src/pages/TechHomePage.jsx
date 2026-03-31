import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useReservations } from '../context/ReservationContext'
import ShiftToggle from '../components/route/ShiftToggle'
import RouteCard from '../components/route/RouteCard'
import BottomNav from '../components/common/BottomNav'

export default function TechHomePage() {
  const [shift, setShift] = useState('AM')
  const { currentUser } = useAuth()
  const { getRouteStops } = useReservations()

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
      <ShiftToggle shift={shift} onChange={setShift} />

      {/* Route list */}
      <div data-testid="route-list">
        {stops.length === 0 ? (
          <div style={styles.empty}>No stops for {shift} shift</div>
        ) : (
          stops.map(stop => (
            <RouteCard key={stop.reservationId} reservation={stop} />
          ))
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
}
