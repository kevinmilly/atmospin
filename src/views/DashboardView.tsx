import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Target, Zap, Globe, Clock, TrendingUp, Star } from 'lucide-react'
import { useAchievementsStore, ALL_ACHIEVEMENTS } from '@/store/achievements'
import type { Achievement } from '@/store/achievements'
import { useXpStore, getLevelInfo } from '@/store/xp'
import { motion } from 'framer-motion'

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  accuracy: 'Accuracy',
  streak: 'Streaks',
  exploration: 'Exploration',
  knowledge: 'Knowledge',
  milestone: 'Milestones',
  difficulty: 'Difficulty',
  misc: 'Misc',
}

const CATEGORY_ORDER: Achievement['category'][] = [
  'accuracy', 'streak', 'exploration', 'knowledge', 'milestone', 'difficulty', 'misc',
]

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: typeof Trophy; sub?: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  )
}

function AchievementCard({ achievement, unlocked, unlockedDate }: { achievement: Achievement; unlocked: boolean; unlockedDate?: string }) {
  return (
    <div className={`relative rounded-xl border p-3 flex items-start gap-3 transition-all ${
      unlocked
        ? 'bg-slate-800/70 border-slate-600/60'
        : 'bg-slate-900/40 border-slate-800/40'
    }`}>
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
        unlocked ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-slate-800/60 border border-slate-700/30'
      }`}>
        <span className={unlocked ? '' : 'opacity-20 grayscale'}>{achievement.icon}</span>
      </div>
      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-slate-600'}`}>
          {unlocked ? achievement.name : '???'}
        </p>
        <p className={`text-xs mt-0.5 leading-relaxed ${unlocked ? 'text-slate-400' : 'text-slate-700'}`}>
          {unlocked ? achievement.description : '???'}
        </p>
        {unlocked && unlockedDate && (
          <p className="text-[10px] text-indigo-400/70 mt-1">
            {new Date(unlockedDate).toLocaleDateString()}
          </p>
        )}
      </div>
      {/* Locked overlay shimmer */}
      {!unlocked && (
        <div className="absolute inset-0 rounded-xl bg-slate-950/30 backdrop-blur-[1px]" />
      )}
    </div>
  )
}

export function DashboardView() {
  const navigate = useNavigate()
  const { stats, unlockedIds, unlockedDates } = useAchievementsStore()
  const unlockedSet = new Set(unlockedIds)
  const totalXp = useXpStore(s => s.totalXp)
  const { current, next, xpIntoLevel, xpForLevel, progress } = getLevelInfo(totalXp)

  const avg = stats.totalRounds > 0 ? Math.round(stats.totalScore / stats.totalRounds) : 0
  const unlockedCount = unlockedIds.length

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/60 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          aria-label="Back"
          className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold text-white">My Dashboard</h1>
        <div className="ml-auto text-xs text-slate-500">{unlockedCount}/{ALL_ACHIEVEMENTS.length} achievements</div>
      </header>

      <div className="p-4 space-y-6 pb-12">
        {/* Level card */}
        <section className="bg-gradient-to-r from-indigo-900/40 to-violet-900/40 border border-indigo-700/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest">Level {current.level}</p>
              <p className="text-2xl font-bold text-white">{current.title}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-indigo-300" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{xpIntoLevel.toLocaleString()} XP</span>
              <span>{next ? `${xpForLevel.toLocaleString()} to ${next.title}` : 'Max Level'}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">{totalXp.toLocaleString()} total XP earned</p>
        </section>

        {/* Stats grid */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Stats</h2>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Total Points" value={stats.totalScore.toLocaleString()} icon={TrendingUp} />
            <StatCard label="Rounds Played" value={stats.totalRounds} icon={Globe} sub="Globe Spin" />
            <StatCard label="Best Score" value={stats.bestScore.toLocaleString()} icon={Target} sub="single round" />
            <StatCard label="Avg Score" value={avg.toLocaleString()} icon={Zap} sub="per round" />
            <StatCard label="Best Streak" value={stats.maxStreak} icon={Trophy} sub="rounds ≥700 pts" />
            <StatCard label="Expert Rounds" value={stats.expertRounds} icon={Clock} sub="no labels" />
          </div>
        </section>

        {/* Progress bar */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Achievement Progress</h2>
            <span className="text-xs text-indigo-400 font-semibold">{unlockedCount}/{ALL_ACHIEVEMENTS.length}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${(unlockedCount / ALL_ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </section>

        {/* Recent activity */}
        {stats.recentRounds.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {stats.recentRounds.slice(0, 8).map(round => (
                <div key={round.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{round.mode === 'hunt' ? '🧭' : '🌍'}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">{round.challengeName}</p>
                      <p className="text-[10px] text-slate-500">{new Date(round.playedAt).toLocaleDateString()} · {round.distanceKm} km off</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold tabular-nums ${round.score >= 700 ? 'text-emerald-400' : round.score >= 300 ? 'text-amber-400' : 'text-red-400'}`}>
                      {round.score}
                    </p>
                    <p className="text-[10px] text-slate-500">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements by category */}
        {CATEGORY_ORDER.map(category => {
          const categoryAchievements = ALL_ACHIEVEMENTS.filter(a => a.category === category)
          return (
            <section key={category}>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[category]}
                <span className="ml-2 text-slate-700 font-normal">
                  {categoryAchievements.filter(a => unlockedSet.has(a.id)).length}/{categoryAchievements.length}
                </span>
              </h2>
              <div className="space-y-2">
                {categoryAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlockedSet.has(achievement.id)}
                    unlockedDate={unlockedDates[achievement.id]}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
