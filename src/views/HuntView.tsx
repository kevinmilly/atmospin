import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe } from 'lucide-react'

export function HuntView() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-3 p-4">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">Hunt Mode</h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
        <Globe className="w-16 h-16 text-slate-700" />
        <p className="text-sm">Globe will render here</p>
      </div>
    </div>
  )
}
