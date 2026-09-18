import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const Home = lazy(() => import('@/pages/Home'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

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
            <Route path="/" element={<Home />} />

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
  )
}