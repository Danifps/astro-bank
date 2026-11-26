import HomeNavbar from '../components/HomeNavbar';
import HomeCarousel from '../components/HomeCarousel';
import QuickNeeds from '../components/QuickNeeds';
import TypographicBanner from '../components/TypographicBanner';
import CreditHeroSection from '../components/CreditHeroSection';
import CardsCarousel from '../components/CardsCarousel';
import QuickMoneyCTA from '../components/QuickMoneyCTA';
import Footer from '../components/Footer';
import BackgroundMusicMute from '../components/BackgroundMusicMute';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';

export default function LandingPage() {
  const { muted, toggleMute } = useBackgroundMusic();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Menú Principal */}
      <HomeNavbar />

      {/* 2. Contenido Principal */}
      <main className="flex-1">
        {/* Carrusel Principal de Imágenes */}
        <HomeCarousel />

        {/* Sección "Cuéntanos, ¿qué necesitas?" estilo Santander */}
        <QuickNeeds />

        {/* Banner "El Crédito Que Despega contigo" con estrellas flotantes */}
        <TypographicBanner />

        {/* Sección Hero Dividida: "Tu crédito, como tú quieras" + foto.png */}
        <CreditHeroSection />

        {/* Carrusel de Tarjetas en Movimiento: "Con Astro Bank alcanzas todo lo que necesitas" */}
        <CardsCarousel />

        {/* Sección CTA: "¿Necesitas dinero rápido?" */}
        <QuickMoneyCTA />
      </main>

      {/* 3. Footer Corporativo */}
      <Footer />

      {/* Botón superdiscreto para mutear la música corporativa de fondo */}
      <BackgroundMusicMute muted={muted} toggleMute={toggleMute} />
    </div>
  );
}
