/**
 * Convert US shoe size to mondo boot sizes.
 * Returns two closest mondo sizes (recommended first, next size up second).
 * Mondo = (US men's + 33) / 2 in cm (approximate)
 * For women's: US women's is ~1.5 sizes larger than men's, so subtract 1.5 first.
 */
export function shoeToMondo(usShoeSizeUS, gender = 'neutral') {
  // Treat as men's sizing for mondopoint
  // Approximate: mondo = US men's * 0.667 + 15.33
  let usMens = usShoeSizeUS
  if (gender === 'womens') usMens = usShoeSizeUS - 1.5

  const mondo = usMens * 0.667 + 15.33

  // Ski boots always come in .5 sizes (25.5, 26.5, 27.5, etc.)
  const rounded = Math.floor(mondo) + 0.5
  const secondary = rounded + 1.0

  return [rounded, secondary]
}

export function formatBootSize(size) {
  // Display as e.g. "26.5" or "27.0" → "27"
  if (size % 1 === 0) return String(size)
  return String(size)
}
