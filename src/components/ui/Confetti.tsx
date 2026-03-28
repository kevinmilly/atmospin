import { motion } from 'framer-motion'

const COLORS = ['#6366f1', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#38bdf8', '#fb923c']

interface Piece {
  id: number
  x: number
  y: number
  rotate: number
  color: string
  size: number
  isCircle: boolean
}

function generatePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 340,
    y: -(Math.random() * 240 + 80),
    rotate: Math.random() * 720 - 360,
    color: COLORS[i % COLORS.length],
    size: Math.random() * 9 + 5,
    isCircle: Math.random() > 0.5,
  }))
}

const PIECES = generatePieces(28)

export function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {PIECES.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: '50%',
            top: '20%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.4 }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.4, 1] }}
        />
      ))}
    </div>
  )
}
