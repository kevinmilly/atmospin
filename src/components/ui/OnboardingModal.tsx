import { useState } from 'react'
import { Globe, MapPin, Lightbulb, Trophy, X, ChevronRight, ChevronLeft } from 'lucide-react'

interface OnboardingModalProps {
  onClose: () => void
}

const SLIDES = [
  {
    icon: Globe,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    title: 'Welcome to Atmospin',
    body: 'Two geography games in one. Test your knowledge of places across the globe — spin, guess, and score points based on how close you get.',
  },
  {
    icon: MapPin,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Globe Spin',
    body: 'Read a clue about a famous place, then tap the globe to drop your pin where you think it is. The closer your guess, the more points you earn.',
  },
  {
    icon: Lightbulb,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Hints & Scoring',
    body: 'Stuck? Reveal hints for extra help — but each hint costs 100 points. The closer your pin to the real location, the higher your score.',
  },
  {
    icon: Trophy,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    title: 'Score & Compete',
    body: 'Scoring is distance-based — even a far-off guess earns something. Sign in to save your scores and compete on the global leaderboard.',
  },
]

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [slide, setSlide] = useState(0)
  const isLast = slide === SLIDES.length - 1
  const { icon: Icon, color, bg, title, body } = SLIDES[slide]

  function next() {
    if (isLast) onClose()
    else setSlide(s => s + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-indigo-400' : 'w-1.5 bg-slate-700'}`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slide content */}
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {slide > 0 && (
            <button
              onClick={() => setSlide(s => s - 1)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLast ? 'Let\'s Play!' : 'Next'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
