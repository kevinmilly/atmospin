import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { estimateContinent } from '@/lib/geo'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'accuracy' | 'streak' | 'exploration' | 'knowledge' | 'milestone' | 'difficulty' | 'misc'
  /** For milestone achievements, show a progress value */
  progressTarget?: number
}

export interface RoundRecord {
  id: string
  mode: 'hunt' | 'spin'
  score: number
  difficulty: number
  distanceKm: number
  hintsUsed: number
  playedAt: string
  challengeName: string
  playerPin: { lat: number; lng: number } | null
}

export interface AchievementStats {
  totalRounds: number
  huntRounds: number
  spinRounds: number
  totalScore: number
  bestScore: number
  bestHuntScore: number
  bestSpinScore: number
  currentStreak: number
  maxStreak: number
  currentHintFreeStreak: number
  maxHintFreeStreak: number
  continentsVisited: string[]
  hemispheresVisited: string[]
  difficultiesPlayed: number[]
  expertRounds: number
  recentRounds: RoundRecord[]
}

// ─── Achievement definitions ──────────────────────────────────────────────────

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Accuracy
  { id: 'first_pin', name: 'First Pin', description: 'Place your very first pin on the globe.', icon: '📍', category: 'accuracy' },
  { id: 'sharpshooter', name: 'Sharpshooter', description: 'Score 900+ points in a single round.', icon: '🎯', category: 'accuracy' },
  { id: 'perfectionist_score', name: 'Perfection', description: 'Score 950+ points in a single round.', icon: '💫', category: 'accuracy' },
  { id: 'bullseye', name: 'Bullseye', description: 'Land within 50 km of the target.', icon: '🎪', category: 'accuracy' },
  { id: 'point_blank', name: 'Point Blank', description: 'Land within 10 km of the target.', icon: '⚡', category: 'accuracy' },
  { id: 'dead_center', name: 'Dead Center', description: 'Land within 1 km of the target.', icon: '💎', category: 'accuracy' },
  // Streak
  { id: 'hot_streak', name: 'Hot Streak', description: '3 rounds in a row scoring 700+ points.', icon: '🔥', category: 'streak' },
  { id: 'on_fire', name: 'On Fire', description: '5 rounds in a row scoring 700+ points.', icon: '🌋', category: 'streak' },
  { id: 'unstoppable', name: 'Unstoppable', description: '10 rounds in a row scoring 700+ points.', icon: '⚡🔥', category: 'streak' },
  { id: 'hint_free', name: 'Perfectionist', description: 'Complete a round without using any hints.', icon: '🧠', category: 'streak' },
  { id: 'hint_free_streak', name: 'No Peeking', description: '5 rounds in a row with no hints used.', icon: '🙈', category: 'streak' },
  // Exploration
  { id: 'world_traveler', name: 'World Traveler', description: 'Place pins in 5 different continents.', icon: '🌍', category: 'exploration', progressTarget: 5 },
  { id: 'globe_trotter', name: 'Globe Trotter', description: 'Place pins in all 7 continents.', icon: '🌐', category: 'exploration', progressTarget: 7 },
  { id: 'both_hemispheres', name: 'Both Sides Now', description: 'Place a pin in both the Northern and Southern hemispheres.', icon: '🌓', category: 'exploration' },
  // Knowledge
  { id: 'spin_doctor', name: 'Spin Doctor', description: 'Complete 10 Globe Spin rounds.', icon: '🌀', category: 'knowledge', progressTarget: 10 },
  { id: 'geography_master', name: 'Geography Master', description: 'Complete 50 Globe Spin rounds.', icon: '🗺️', category: 'knowledge', progressTarget: 50 },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 Globe Spin rounds.', icon: '💯', category: 'knowledge', progressTarget: 100 },
  // Milestone
  { id: 'first_steps', name: 'First Steps', description: 'Earn 1,000 total points across all games.', icon: '👣', category: 'milestone', progressTarget: 1000 },
  { id: 'getting_serious', name: 'Getting Serious', description: 'Earn 10,000 total points.', icon: '📈', category: 'milestone', progressTarget: 10000 },
  { id: 'champion', name: 'Champion', description: 'Earn 50,000 total points.', icon: '🏆', category: 'milestone', progressTarget: 50000 },
  { id: 'legend', name: 'Legend', description: 'Earn 100,000 total points.', icon: '👑', category: 'milestone', progressTarget: 100000 },
  // Difficulty
  { id: 'no_training_wheels', name: 'No Training Wheels', description: 'Complete a round on Expert difficulty.', icon: '🎓', category: 'difficulty' },
  { id: 'expert_hunter', name: 'Expert Hunter', description: 'Complete 10 rounds on Expert difficulty.', icon: '🦅', category: 'difficulty', progressTarget: 10 },
  { id: 'challenge_accepted', name: 'Challenge Accepted', description: 'Play on all 4 difficulty tiers.', icon: '🎲', category: 'difficulty', progressTarget: 4 },
  // Misc
  { id: 'night_owl', name: 'Night Owl', description: 'Play between midnight and 4 AM.', icon: '🦉', category: 'misc' },
  { id: 'globeaholic', name: 'Globeaholic', description: 'Play 100 total rounds.', icon: '🌎', category: 'misc', progressTarget: 100 },
  { id: 'close_but', name: 'Brutal Guess', description: 'Score below 10 points on a round.', icon: '😬', category: 'misc' },
]

// ─── Check logic ──────────────────────────────────────────────────────────────

function checkConditions(stats: AchievementStats, round: RoundRecord, alreadyUnlocked: Set<string>): string[] {
  const newly: string[] = []

  function tryUnlock(id: string) {
    if (!alreadyUnlocked.has(id)) newly.push(id)
  }

  // Accuracy
  if (stats.totalRounds >= 1) tryUnlock('first_pin')
  if (round.score >= 900) tryUnlock('sharpshooter')
  if (round.score >= 950) tryUnlock('perfectionist_score')
  if (round.distanceKm <= 50) tryUnlock('bullseye')
  if (round.distanceKm <= 10) tryUnlock('point_blank')
  if (round.distanceKm <= 1) tryUnlock('dead_center')

  // Streak
  if (stats.currentStreak >= 3) tryUnlock('hot_streak')
  if (stats.currentStreak >= 5) tryUnlock('on_fire')
  if (stats.currentStreak >= 10) tryUnlock('unstoppable')
  if (round.hintsUsed === 0) tryUnlock('hint_free')
  if (stats.currentHintFreeStreak >= 5) tryUnlock('hint_free_streak')

  // Exploration
  if (stats.continentsVisited.length >= 5) tryUnlock('world_traveler')
  if (stats.continentsVisited.length >= 7) tryUnlock('globe_trotter')
  if (stats.hemispheresVisited.includes('north') && stats.hemispheresVisited.includes('south')) tryUnlock('both_hemispheres')

  // Knowledge
  if (stats.spinRounds >= 10) tryUnlock('spin_doctor')
  if (stats.spinRounds >= 50) tryUnlock('geography_master')
  if (stats.spinRounds >= 100) tryUnlock('centurion')

  // Milestone
  if (stats.totalScore >= 1000) tryUnlock('first_steps')
  if (stats.totalScore >= 10000) tryUnlock('getting_serious')
  if (stats.totalScore >= 50000) tryUnlock('champion')
  if (stats.totalScore >= 100000) tryUnlock('legend')

  // Difficulty
  if (round.difficulty === 4) tryUnlock('no_training_wheels')
  if (stats.expertRounds >= 10) tryUnlock('expert_hunter')
  if (stats.difficultiesPlayed.length >= 4) tryUnlock('challenge_accepted')

  // Misc
  const hour = new Date().getHours()
  if (hour >= 0 && hour < 4) tryUnlock('night_owl')
  if (stats.totalRounds >= 100) tryUnlock('globeaholic')
  if (round.score < 10) tryUnlock('close_but')

  return newly
}

// ─── Store ────────────────────────────────────────────────────────────────────

const INITIAL_STATS: AchievementStats = {
  totalRounds: 0,
  huntRounds: 0,
  spinRounds: 0,
  totalScore: 0,
  bestScore: 0,
  bestHuntScore: 0,
  bestSpinScore: 0,
  currentStreak: 0,
  maxStreak: 0,
  currentHintFreeStreak: 0,
  maxHintFreeStreak: 0,
  continentsVisited: [],
  hemispheresVisited: [],
  difficultiesPlayed: [],
  expertRounds: 0,
  recentRounds: [],
}

interface AchievementsState {
  unlockedIds: string[]
  unlockedDates: Record<string, string>
  stats: AchievementStats
  /** Queue of newly unlocked achievement IDs waiting to be shown as toasts */
  toastQueue: string[]
  /** Record a completed round and get back newly unlocked IDs */
  recordRound: (round: Omit<RoundRecord, 'id'>) => string[]
  dismissToast: () => void
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlockedIds: [],
      unlockedDates: {},
      stats: INITIAL_STATS,
      toastQueue: [],

      recordRound: (roundInput) => {
        const round: RoundRecord = { ...roundInput, id: `${Date.now()}-${Math.random()}` }
        const { stats, unlockedIds, unlockedDates } = get()

        // Update stats
        const pin = round.playerPin
        const continent = pin ? estimateContinent(pin.lat, pin.lng) : null
        const hemisphere = pin ? (pin.lat >= 0 ? 'north' : 'south') : null

        const newStats: AchievementStats = {
          totalRounds: stats.totalRounds + 1,
          huntRounds: stats.huntRounds + (round.mode === 'hunt' ? 1 : 0),
          spinRounds: stats.spinRounds + (round.mode === 'spin' ? 1 : 0),
          totalScore: stats.totalScore + round.score,
          bestScore: Math.max(stats.bestScore, round.score),
          bestHuntScore: round.mode === 'hunt' ? Math.max(stats.bestHuntScore, round.score) : stats.bestHuntScore,
          bestSpinScore: round.mode === 'spin' ? Math.max(stats.bestSpinScore, round.score) : stats.bestSpinScore,
          currentStreak: round.score >= 700 ? stats.currentStreak + 1 : 0,
          maxStreak: Math.max(stats.maxStreak, round.score >= 700 ? stats.currentStreak + 1 : stats.currentStreak),
          currentHintFreeStreak: round.hintsUsed === 0 ? stats.currentHintFreeStreak + 1 : 0,
          maxHintFreeStreak: Math.max(stats.maxHintFreeStreak, round.hintsUsed === 0 ? stats.currentHintFreeStreak + 1 : stats.currentHintFreeStreak),
          continentsVisited: continent && !stats.continentsVisited.includes(continent)
            ? [...stats.continentsVisited, continent]
            : stats.continentsVisited,
          hemispheresVisited: hemisphere && !stats.hemispheresVisited.includes(hemisphere)
            ? [...stats.hemispheresVisited, hemisphere]
            : stats.hemispheresVisited,
          difficultiesPlayed: !stats.difficultiesPlayed.includes(round.difficulty)
            ? [...stats.difficultiesPlayed, round.difficulty]
            : stats.difficultiesPlayed,
          expertRounds: stats.expertRounds + (round.difficulty === 4 ? 1 : 0),
          recentRounds: [round, ...stats.recentRounds].slice(0, 20),
        }

        // Check for new achievements
        const alreadyUnlocked = new Set(unlockedIds)
        const newlyUnlocked = checkConditions(newStats, round, alreadyUnlocked)

        const now = new Date().toISOString()
        const newDates: Record<string, string> = { ...unlockedDates }
        for (const id of newlyUnlocked) newDates[id] = now

        set({
          stats: newStats,
          unlockedIds: [...unlockedIds, ...newlyUnlocked],
          unlockedDates: newDates,
          toastQueue: [...get().toastQueue, ...newlyUnlocked],
        })

        return newlyUnlocked
      },

      dismissToast: () => {
        set((s) => ({ toastQueue: s.toastQueue.slice(1) }))
      },
    }),
    { name: 'atmospin-achievements' },
  ),
)
