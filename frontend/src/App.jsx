import { useLayoutEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import InvestorLoginPage from './pages/InvestorLoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import QuienesSomosPage from './pages/QuienesSomosPage'
import SolucionesCreditoPage from './pages/SolucionesCreditoPage'
import ParaInversionistasPage from './pages/ParaInversionistasPage'
import PreguntasFrecuentesPage from './pages/PreguntasFrecuentesPage'
import SegurosPage from './pages/SegurosPage'

/**
 * Restablece el scroll al inicio de la página en cada cambio de ruta.
 */
function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Acceso Banca Personas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/personas" element={<LoginPage />} />
        
        {/* Acceso Inversionistas */}
        <Route path="/login-inversionistas" element={<InvestorLoginPage />} />
        <Route path="/login/inversionistas" element={<InvestorLoginPage />} />
        
        {/* Registro y Dashboard */}
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Páginas informativas (Sobre nosotros) */}
        <Route path="/quienes-somos" element={<QuienesSomosPage />} />
        <Route path="/soluciones-de-credito" element={<SolucionesCreditoPage />} />
        <Route path="/para-inversionistas" element={<ParaInversionistasPage />} />
        <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
        <Route path="/seguros" element={<SegurosPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
