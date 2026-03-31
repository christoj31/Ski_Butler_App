export function generateReservationId() {
  const year = new Date().getFullYear()
  const suffix = String(Date.now()).slice(-5)
  return `RES-${year}-N${suffix}`
}

export function formatCurrency(cents) {
  return `$${cents}`
}

export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}/${y}`
}
