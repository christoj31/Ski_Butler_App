import { createContext, useState, useContext } from 'react'

export const PackingContext = createContext(null)

export function PackingProvider({ children, initialPackItems = [] }) {
  const [packItems, setPackItems] = useState(initialPackItems)

  function getPackItemsByDate(dateString) {
    return packItems.filter(item => item.packDate === dateString)
  }

  function markAsPacked(packItemId, inventoryNumbers = {}) {
    setPackItems(prev =>
      prev.map(item =>
        item.packItemId === packItemId
          ? { ...item, packed: true, packedAt: new Date().toISOString(), inventoryNumbers }
          : item
      )
    )
  }

  function addPackItemsFromReservation(reservation) {
    const newItems = (reservation.renters || []).map((renter, idx) => ({
      packItemId: `pack-${reservation.reservationId}-${idx}`,
      reservationId: reservation.reservationId,
      renterId: renter.renterId,
      renterName: renter.name,
      packDate: reservation.deliveryDate,
      packageId: renter.packageId,
      packageName: renter.packageName || renter.packageId,
      category: renter.packageId?.includes('snowboard') ? 'snowboard' : 'ski',
      bootSizes: renter.bootSizes || [],
      recommendedBootIndex: 0,
      bootInventoryNumbers: [],
      skiInventoryNumber: '',
      recommendedPoleLength: renter.recommendedPoleLength || null,
      poleInventoryNumber: '',
      dinRange: renter.dinRange || null,
      packed: false,
      packedAt: null,
    }))
    setPackItems(prev => [...prev, ...newItems])
  }

  return (
    <PackingContext.Provider value={{
      packItems,
      getPackItemsByDate,
      markAsPacked,
      addPackItemsFromReservation,
    }}>
      {children}
    </PackingContext.Provider>
  )
}

export function usePackItems() {
  const ctx = useContext(PackingContext)
  if (!ctx) throw new Error('usePackItems must be used within PackingProvider')
  return ctx
}
