import { motion } from 'framer-motion'
import { getLevelInfo, useXpStore } from '@/store/xp'

export function XPBar() {
  const totalXp = useXpStore(s => s.totalXp)
  const { current, next, xpIntoLevel, xpForLevel, progress } = getLevelInfo(totalXp)

  return (
    <div className="w-full max-w-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-indigo-300">
          {current.title} <span className="text-slate-500 font-normal">· Lv {current.level}</span>
        </span>
        <span className="text-[10px] text-slate-500 tabular-nums">
          {xpIntoLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
      {!next && (
        <p className="text-[10px] text-amber-400 text-center">Max Level Reached</p>
      )}
    </div>
  )
}
