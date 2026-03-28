import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAchievementsStore, ALL_ACHIEVEMENTS } from '@/store/achievements'

export function AchievementToast() {
  const { toastQueue, dismissToast } = useAchievementsStore()
  const currentId = toastQueue[0]
  const achievement = currentId ? ALL_ACHIEVEMENTS.find(a => a.id === currentId) : null

  useEffect(() => {
    if (!achievement) return
    const t = setTimeout(dismissToast, 4000)
    return () => clearTimeout(t)
  }, [achievement, dismissToast])

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={currentId}
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="bg-slate-900 border border-indigo-500/60 rounded-2xl px-4 py-3 shadow-[0_0_32px_rgba(99,102,241,0.3)] flex items-center gap-3 min-w-[260px] max-w-[320px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
              {achievement.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Achievement Unlocked</p>
              <p className="text-sm font-bold text-white truncate">{achievement.name}</p>
              <p className="text-xs text-slate-400 line-clamp-1">{achievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
