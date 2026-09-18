import { Route, Routes } from 'react-router'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Projects from '@/pages/Projects'
import ProjectDetails from '@/pages/ProjectDetails'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <div className="flex-1">
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
      </div>

      <Footer />
    </div>
  )
}