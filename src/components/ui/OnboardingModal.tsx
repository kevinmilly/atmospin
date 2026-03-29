import { useState } from 'react'
import { Globe, MapPin, Lightbulb, Trophy, X, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react'

interface OnboardingModalProps {
  onClose: () => void
}

// Slide 0 uses a custom layout — others use the standard icon+text layout
const SLIDES = [
  {
    icon: Globe,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    title: null, // custom render
    body: null,
  },
  {
    icon: BookOpen,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    title: 'New to Geography? Start Here',
    body: 'Learn Mode spins the globe to a random place and shares a weird-but-true fact. Answer a quick quiz to earn XP — no pressure, just discovery.',
  },
  {
    icon: MapPin,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Globe Spin',
    body: 'Read a clue about a famous place, then tap the globe to drop your pin. The closer your guess, the more points you earn.',
  },
  {
    icon: Lightbulb,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Hints & Speed Bonus',
    body: 'Reveal hints for help — each one costs 100 pts. On Medium/Hard/Expert a countdown timer runs, and submitting fast earns a speed bonus.',
  },
  {
    icon: Trophy,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    title: 'Score & Compete',
    body: 'Even a far-off guess earns something. Sign in to save your scores and compete on the global leaderboard.',
  },
]

const CHALLENGE_PLACES = ['Patagonia 🏔️', 'Svalbard 🧊', 'Niue 🏝️', 'Socotra 🌿', 'Faroe Islands 🌊']

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
        {slide === 0 ? (
          // Challenge-first opening slide
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="space-y-1">
              <p className="text-base font-bold text-white">Do you know where these are?</p>
              <p className="text-xs text-slate-500">Most people don't — yet.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {CHALLENGE_PLACES.map(place => (
                <span
                  key={place}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium"
                >
                  {place}
                </span>
              ))}
            </div>
            <p className="text-sm text-indigo-300 leading-relaxed font-medium">
              Atmospin will teach you — and make it weirdly fun.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
            </div>
          </div>
        )}

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
