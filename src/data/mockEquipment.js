export const PACKAGES = [
  { packageId: 'basic-ski', name: 'Basic Ski', category: 'ski', pricePerDay: 45, description: 'All-mountain beginner ski package. Includes skis, boots, and poles.' },
  { packageId: 'signature-ski', name: 'Signature Ski', category: 'ski', pricePerDay: 65, description: 'Mid-performance all-mountain ski. Improved control for intermediate skiers.' },
  { packageId: 'performance-ski', name: 'Performance Ski', category: 'ski', pricePerDay: 95, description: 'High-performance carving ski. Maximum edge grip for advanced and expert skiers.' },
  { packageId: 'basic-snowboard', name: 'Basic Snowboard', category: 'snowboard', pricePerDay: 50, description: 'All-mountain snowboard package. Includes board and boots.' },
  { packageId: 'signature-snowboard', name: 'Signature Snowboard', category: 'snowboard', pricePerDay: 70, description: 'Mid-performance all-mountain board. Enhanced flex for intermediate riders.' },
]

export const ADD_ONS = [
  { addOnId: 'helmet', name: 'Helmet', pricePerDay: 15, hasSizeSelector: true, sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { addOnId: 'goggles', name: 'Goggles', pricePerDay: 10, hasSizeSelector: false },
  { addOnId: 'premium-comfort-boots', name: 'Upgrade: Premium Comfort Boots', pricePerDay: 20, hasSizeSelector: false },
  { addOnId: 'high-performance-boots', name: 'Upgrade: High Performance Boots', pricePerDay: 35, hasSizeSelector: false },
]

export function getPackageById(id) {
  return PACKAGES.find(p => p.packageId === id)
}

export function getAddOnById(id) {
  return ADD_ONS.find(a => a.addOnId === id)
}

export function computeTotal(renters, rentalDays = 1) {
  return renters.reduce((total, renter) => {
    const pkg = getPackageById(renter.packageId)
    const pkgCost = pkg ? pkg.pricePerDay * rentalDays : 0
    const addOnCost = (renter.addOns || []).reduce((sum, ao) => {
      const addOn = getAddOnById(ao.addOnId)
      return sum + (addOn ? addOn.pricePerDay * rentalDays : 0)
    }, 0)
    return total + pkgCost + addOnCost
  }, 0)
}
