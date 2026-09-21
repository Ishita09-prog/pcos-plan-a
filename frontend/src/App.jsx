import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import BackgroundImage from './components/BackgroundImage.jsx'
import ParticleField from './components/ParticleField.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Landing from './pages/Landing.jsx'
import Questionnaire from './pages/Questionnaire.jsx'
import Results from './pages/Results.jsx'

// Video is intentionally landing-page-only for now (per Ishi: "keep only landing
// page video for now") — assessment/results keep their still, duotoned images.
const BACKDROPS = {
  '/': { image: '/media/hero-bg.jpg', video: '/media/hero-bg.mp4' },
  '/assessment': { image: '/media/assessment-bg.jpg' },
  '/results': { image: '/media/results-bg.jpg' },
}

function backdropFor(pathname) {
  if (BACKDROPS[pathname]) return BACKDROPS[pathname]
  if (pathname.startsWith('/results')) return BACKDROPS['/results']
  return BACKDROPS['/']
}

export default function App() {
  const location = useLocation()
  const backdrop = backdropFor(location.pathname)

  return (
    <div className="relative min-h-screen">
      <BackgroundImage image={backdrop.image} video={backdrop.video} />
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 z-[2] grid-overlay opacity-30" />
      <div className="pointer-events-none fixed inset-0 z-[3] noise-overlay" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Landing />} />
              <Route path="/assessment" element={<Questionnaire />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
