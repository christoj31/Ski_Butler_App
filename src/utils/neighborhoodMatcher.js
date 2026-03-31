const RULES = [
  [/beaver creek/i, 'Beaver Creek Village'],
  [/bachelor/i, 'Bachelor Gulch'],
  [/arrowhead/i, 'Arrowhead'],
  [/vail/i, 'Vail Village'],
  [/avon/i, 'Avon / Edwards'],
  [/edwards/i, 'Avon / Edwards'],
]

export function matchNeighborhood(address) {
  for (const [pattern, label] of RULES) {
    if (pattern.test(address)) return label
  }
  return 'Avon / Edwards'
}
