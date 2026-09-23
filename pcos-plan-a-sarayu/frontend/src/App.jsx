import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import BackgroundImage from './components/BackgroundImage.jsx'
import ParticleDNABackground from './components/ParticleDNABackground.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import DoctorTests from './pages/DoctorTests.jsx'
import Journey from './pages/Journey.jsx'
import Landing from './pages/Landing.jsx'
import Questionnaire from './pages/Questionnaire.jsx'
import Register from './pages/Register.jsx'
import Results from './pages/Results.jsx'

const BACKDROPS = {
  '/': { image: '/media/hero-bg.jpg', video: '/media/hero-bg.mp4' },
  '/register': { image: '/media/assessment-bg.jpg' },
  '/doctor-tests': { image: '/media/results-bg.jpg' },
  '/journey': { image: '/media/assessment-bg.jpg' },
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-body antialiased">
      <BackgroundImage image={backdrop.image} video={backdrop.video} />
      <ParticleDNABackground />
      <div className="pointer-events-none fixed inset-0 z-[2] grid-overlay opacity-30" />
      <div className="pointer-events-none fixed inset-0 z-[3] noise-overlay" />

      {/* Site Header */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <SiteHeader />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctor-tests" element={<DoctorTests />} />
              <Route path="/journey" element={<Journey />} />
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
