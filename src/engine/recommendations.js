import {
  SAVINGS_RECOMMENDATIONS,
  FAMILY_ADJUSTMENTS,
  PER_KID_ADJUSTMENT,
  MAX_KID_ADJUSTMENT,
  SAVINGS_RATE_FLOOR,
} from '../utils/constants'

/**
 * Calculate the recommended savings rate and alert severity for a given profile.
 *
 * @param {{ ageGroup: string, familySituation: string, numberOfKids: number }} profile
 * @param {number} actualRate - The user's actual savings rate as a percentage
 * @returns {{ recommendedRate, severity, label, shortfallNote }}
 */
export function getRecommendation({ ageGroup, familySituation, numberOfKids }, actualRate = null) {
  const baseRate = SAVINGS_RECOMMENDATIONS[ageGroup] ?? 15
  const familyAdjustment = FAMILY_ADJUSTMENTS[familySituation] ?? 0

  const kidsCount = familySituation === 'couple+kids' ? (numberOfKids ?? 0) : 0
  const kidAdjustment = Math.max(kidsCount * PER_KID_ADJUSTMENT, MAX_KID_ADJUSTMENT)

  const recommendedRate = Math.max(
    SAVINGS_RATE_FLOOR,
    baseRate + familyAdjustment + kidAdjustment
  )

  let severity = null
  let shortfallNote = null

  if (actualRate !== null) {
    const diff = actualRate - recommendedRate
    if (diff >= 0) {
      severity = 'green'
    } else if (diff >= -5) {
      severity = 'amber'
    } else {
      severity = 'red'
    }

    if (severity !== 'green') {
      shortfallNote = `${Math.abs(diff).toFixed(1)}% below recommended`
    }
  }

  const label = `Recommended for your profile: ${recommendedRate}%`

  return { recommendedRate, severity, label, shortfallNote }
}
