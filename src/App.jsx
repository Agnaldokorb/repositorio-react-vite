import { lazy, Suspense, useCallback, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProjectsIntro from '@/components/projects/ProjectsIntro'

const SiteBackground = lazy(() => import('@/components/layout/SiteBackground'))

const Home = lazy(() => import('@/pages/Home'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const INTRO_STORAGE_KEY = 'portfolio:projects-intro-seen'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [introLocationKey, setIntroLocationKey] = useState(null)

  const [introSeen, setIntroSeen] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const showIntro = introLocationKey === location.key

  const openProjects = useCallback(() => {
    if (
      introSeen ||
      location.pathname === '/projetos' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      navigate('/projetos')
      return
    }

    setIntroLocationKey(location.key)
  }, [introSeen, location.key, location.pathname, navigate])

  const finishIntro = useCallback(() => {
    setIntroLocationKey(null)
    setIntroSeen(true)

    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true')
    } catch {
      // Mantém a preferência no estado enquanto o app estiver aberto.
    }

    navigate('/projetos')
  }, [navigate])

  return (
    <div className="relative isolate min-h-screen bg-background text-foreground">
      <Suspense fallback={null}>
        <SiteBackground />
      </Suspense>

<<<<<<< HEAD
=======
      {/* Conteúdo acima do fundo */}
>>>>>>> develop
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header onProjectsClick={openProjects} />

        <div className="flex-1">
          <Suspense
            fallback={
              <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
                <p role="status" className="text-muted-foreground">
                  Carregando página...
                </p>
              </main>
            }
          >
            <Routes>
              <Route
                path="/"
                element={<Home onProjectsClick={openProjects} />}
              />

              <Route path="/projetos" element={<Projects />} />

              <Route
                path="/projetos/:slug"
                element={<ProjectDetails />}
              />

              <Route path="/contato" element={<Contact />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </div>

      {showIntro && <ProjectsIntro onFinish={finishIntro} />}
    </div>
  )
}