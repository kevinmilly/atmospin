import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Level definitions ────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1,  xp: 0,      title: 'Wanderer' },
  { level: 2,  xp: 150,    title: 'Scout' },
  { level: 3,  xp: 350,    title: 'Explorer' },
  { level: 4,  xp: 650,    title: 'Tracker' },
  { level: 5,  xp: 1050,   title: 'Pathfinder' },
  { level: 6,  xp: 1600,   title: 'Trailblazer' },
  { level: 7,  xp: 2350,   title: 'Voyager' },
  { level: 8,  xp: 3300,   title: 'Navigator' },
  { level: 9,  xp: 4550,   title: 'Geographer' },
  { level: 10, xp: 6100,   title: 'Cartographer' },
  { level: 11, xp: 8050,   title: 'Archivist' },
  { level: 12, xp: 10500,  title: 'Chronicler' },
  { level: 13, xp: 13500,  title: 'Sage' },
  { level: 14, xp: 17100,  title: 'Master' },
  { level: 15, xp: 21400,  title: 'Grandmaster' },
  { level: 16, xp: 26500,  title: 'Legend' },
  { level: 17, xp: 32500,  title: 'Mythic' },
  { level: 18, xp: 39500,  title: 'Titan' },
  { level: 19, xp: 47700,  title: 'Immortal' },
  { level: 20, xp: 57200,  title: 'Omniscient' },
] as const

type LevelEntry = typeof LEVELS[number]

export function getLevelInfo(totalXp: number) {
  let current: LevelEntry = LEVELS[0]
  let next: LevelEntry | undefined = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xp) {
      current = LEVELS[i]
      next = LEVELS[i + 1]
      break
    }
  }
  const xpIntoLevel = totalXp - current.xp
  const xpForLevel = next ? next.xp - current.xp : 1
  return { current, next, xpIntoLevel, xpForLevel, progress: Math.min(1, xpIntoLevel / xpForLevel) }
}

export function calcXpGain(score: number, hintsUsed: number, isNewContinent: boolean, isPersonalBest: boolean, streakBonus: boolean): number {
  let xp = Math.floor(score / 8)              // base: max ~125 per perfect
  if (hintsUsed === 0) xp += 25              // no-hint bonus
  if (streakBonus) xp += 30                  // on a streak (3+)
  if (isNewContinent) xp += 40               // explored new continent
  if (isPersonalBest) xp += 20              // beat your record
  return Math.max(1, xp)
}

// ─── Streak multiplier ────────────────────────────────────────────────────────

export function getStreakMultiplier(streak: number): number {
  if (streak >= 20) return 2.0
  if (streak >= 10) return 1.5
  if (streak >= 5)  return 1.25
  if (streak >= 3)  return 1.1
  return 1.0
}

export function getStreakLabel(streak: number): string {
  if (streak >= 20) return '×2.0'
  if (streak >= 10) return '×1.5'
  if (streak >= 5)  return '×1.25'
  if (streak >= 3)  return '×1.1'
  return '×1.0'
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface XpState {
  totalXp: number
  /** Personal best distance (km) keyed by place id — lower = better */
  personalBests: Record<string, number>
  addXp: (amount: number) => { leveled: boolean; newLevel: number }
  recordPersonalBest: (placeId: string, distanceKm: number) => boolean
}

export const useXpStore = create<XpState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      personalBests: {},

      addXp: (amount) => {
        const before = getLevelInfo(get().totalXp)
        set(s => ({ totalXp: s.totalXp + amount }))
        const after = getLevelInfo(get().totalXp)
        const leveled = after.current.level > before.current.level
        return { leveled, newLevel: after.current.level }
      },

      recordPersonalBest: (placeId, distanceKm) => {
        const prev = get().personalBests[placeId]
        const isNew = prev === undefined || distanceKm < prev
        if (isNew) {
          set(s => ({ personalBests: { ...s.personalBests, [placeId]: distanceKm } }))
        }
        return isNew
      },
    }),
    { name: 'atmospin-xp' },
  ),
)
