import { createContext, useState, useContext } from 'react'

export const ReservationContext = createContext(null)

export function ReservationProvider({ children, initialReservations = [] }) {
  const [reservations, setReservations] = useState(initialReservations)

  function getRouteStops(shift, date) {
    return reservations.filter(
      r => r.deliveryShift === shift &&
           r.deliveryDate === date &&
           r.status !== 'cancelled'
    )
  }

  function getReservationById(id) {
    return reservations.find(r => r.reservationId === id) || null
  }

  function addReservation(reservation) {
    setReservations(prev => [...prev, reservation])
  }

  function updateReservation(id, changes) {
    setReservations(prev =>
      prev.map(r => r.reservationId === id ? { ...r, ...changes } : r)
    )
  }

  function getSearchResults(filters = {}) {
    let results = [...reservations]

    if (filters.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(r =>
        r.renters?.some(renter => renter.name.toLowerCase().includes(q)) ||
        r.reservationId.toLowerCase().includes(q)
      )
    }
    if (filters.deliveryType) {
      results = results.filter(r => r.deliveryType === filters.deliveryType)
    }
    if (filters.assignedTech) {
      results = results.filter(r => r.assignedTech === filters.assignedTech)
    }
    if (filters.status) {
      results = results.filter(r => r.status === filters.status)
    }
    if (filters.neighborhood) {
      results = results.filter(r => r.neighborhood === filters.neighborhood)
    }
    if (filters.priceMin != null) {
      results = results.filter(r => (r.totalPrice || 0) >= filters.priceMin)
    }
    if (filters.priceMax != null) {
      results = results.filter(r => (r.totalPrice || 0) <= filters.priceMax)
    }
    if (filters.dateFrom) {
      results = results.filter(r => r.deliveryDate >= filters.dateFrom)
    }
    if (filters.dateTo) {
      results = results.filter(r => r.deliveryDate <= filters.dateTo)
    }

    return results
  }

  return (
    <ReservationContext.Provider value={{
      reservations,
      getRouteStops,
      getReservationById,
      addReservation,
      updateReservation,
      getSearchResults,
    }}>
      {children}
    </ReservationContext.Provider>
  )
}

export function useReservations() {
  const ctx = useContext(ReservationContext)
  if (!ctx) throw new Error('useReservations must be used within ReservationProvider')
  return ctx
}
