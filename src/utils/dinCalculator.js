/**
 * Calculate DIN setting range based on weight, height, and ability.
 * Uses simplified DIN lookup chart.
 */
const ABILITY_CODE = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
}

export function calculateDIN(weightLbs, heightFt, heightIn, ability) {
  const weightKg = weightLbs * 0.453592
  const heightCm = (heightFt * 30.48) + (heightIn * 2.54)
  const abilityCode = ABILITY_CODE[ability] || 2

  // Simplified DIN table based on weight
  let baseDIN
  if (weightKg < 20) baseDIN = 0.75
  else if (weightKg < 30) baseDIN = 1.25
  else if (weightKg < 40) baseDIN = 1.75
  else if (weightKg < 50) baseDIN = 2.5
  else if (weightKg < 60) baseDIN = 3.5
  else if (weightKg < 70) baseDIN = 4.5
  else if (weightKg < 80) baseDIN = 5.5
  else if (weightKg < 90) baseDIN = 6.5
  else if (weightKg < 100) baseDIN = 7.5
  else baseDIN = 9

  // Adjust for ability
  const adjustment = (abilityCode - 2) * 0.5
  const recommended = Math.max(0.75, baseDIN + adjustment)

  return {
    min: Math.max(0.75, recommended - 0.5),
    max: recommended + 0.5,
    recommended,
  }
}

export function recommendedPoleLength(heightFt, heightIn) {
  const heightCm = (heightFt * 30.48) + (heightIn * 2.54)
  // Standard: pole length ≈ 0.68 × height in cm, rounded to nearest 5cm
  const length = Math.round((heightCm * 0.68) / 5) * 5
  return length
}
