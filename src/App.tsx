import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useAppStore } from '@/store/app'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AchievementToast } from '@/components/ui/AchievementToast'

const HomeView = lazy(() => import('@/views/HomeView').then(m => ({ default: m.HomeView })))
const GlobeSpinView = lazy(() => import('@/views/GlobeSpinView').then(m => ({ default: m.GlobeSpinView })))
const LeaderboardView = lazy(() => import('@/views/LeaderboardView').then(m => ({ default: m.LeaderboardView })))
const DashboardView = lazy(() => import('@/views/DashboardView').then(m => ({ default: m.DashboardView })))
const LearnModeView = lazy(() => import('@/views/LearnModeView').then(m => ({ default: m.LearnModeView })))

function ScreenLoader() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
      Loading...
    </div>
  )
}

function UpdateBanner() {
  const setUpdateAvailable = useAppStore(s => s.setUpdateAvailable)
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onNeedRefresh() { setUpdateAvailable(true) },
  })

  if (!needRefresh[0]) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-sm font-medium">Update available</p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors"
      >
        Refresh
      </button>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <UpdateBanner />
        <AchievementToast />
        <div className="h-full">
          <Suspense fallback={<ScreenLoader />}>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/globe-spin" element={<GlobeSpinView />} />
              <Route path="/leaderboard" element={<LeaderboardView />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/learn" element={<LearnModeView />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
