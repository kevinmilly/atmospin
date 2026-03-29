import type { DifficultyTier } from '@/store/settings'
import { DIFFICULTY_CONFIG } from '@/store/settings'

export interface SharePayload {
  challengeName: string
  country: string
  totalScore: number
  distanceKm: number
  difficulty: DifficultyTier
  hintsUsed: number
  xpGained: number
  isPersonalBest: boolean
  speedBonus: number
  roundsPlayed: number
  sessionScore: number
}

function scoreToBlocks(score: number): string {
  const filled = Math.round((score / 1000) * 10)
  const green = '🟢'
  const empty = '⬜'
  return green.repeat(Math.max(0, filled)) + empty.repeat(Math.max(0, 10 - filled))
}

export function buildShareText(p: SharePayload): string {
  const diffName = DIFFICULTY_CONFIG[p.difficulty].name
  const blocks = scoreToBlocks(p.totalScore)
  const lines: string[] = [
    `Atmospin 🌍 Round ${p.roundsPlayed}`,
    `📍 ${p.challengeName}${p.country && p.country !== p.challengeName ? `, ${p.country}` : ''}`,
    '',
    `${blocks}  ${p.totalScore.toLocaleString()}/1000`,
    '',
  ]

  const details: string[] = [`📏 ${p.distanceKm.toLocaleString()} km off`, diffName]
  if (p.xpGained > 0) details.push(`+${p.xpGained} XP`)
  lines.push(details.join(' · '))

  if (p.speedBonus > 0) lines.push(`⚡ Speed bonus +${p.speedBonus} pts`)
  if (p.isPersonalBest) lines.push('🏆 New personal best!')

  lines.push('')
  lines.push('atmospin.app')

  return lines.join('\n')
}

export async function shareResult(p: SharePayload): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildShareText(p)
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Atmospin', text })
      return 'shared'
    }
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'failed'
    }
  }
}
