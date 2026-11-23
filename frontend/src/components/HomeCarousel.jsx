import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import '../styles/HomeCarousel.css';

/**
 * ========================================================
 * CONFIGURACIÓN DE LAS IMÁGENES / SLIDES DEL CARRUSEL
 * ========================================================
 * Para agregar tus imágenes:
 * 1. Coloca tus imágenes en 'frontend/src/assets/' (ej: banner1.jpg)
 * 2. Impórtalas o coloca la ruta en la propiedad 'image'.
 *    Ejemplo: image: '/src/assets/banner1.jpg' o 'import banner1 from ...'
 */
const CAROUSEL_SLIDES = [
  {
    id: 1,
    tag: 'Banca Digital Astro',
    title: 'Tu futuro financiero despega con Astro Bank',
    subtitle: 'Créditos rápidos, seguros y transparentes adaptados a tus metas.',
    image: '', // <-- AGREGA AQUÍ TU PRIMERA IMAGEN
    bgColor: '#0F172A'
  },
  {
    id: 2,
    tag: 'Créditos Personales',
    title: 'Financiamiento ágil al instante',
    subtitle: 'Solicita tu crédito en minutos sin papeleos innecesarios.',
    image: '', // <-- AGREGA AQUÍ TU SEGUNDA IMAGEN
    bgColor: '#1E293B'
  },
  {
    id: 3,
    tag: 'Inversiones',
    title: 'Haz crecer tu patrimonio de forma segura',
    subtitle: 'Rendimientos garantizados con el respaldo que necesitas.',
    image: '', // <-- AGREGA AQUÍ TU TERCERA IMAGEN
    bgColor: '#0284C7'
  }
];

export default function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const totalSlides = CAROUSEL_SLIDES.length;

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Efecto de cambio automático (pasa poco a poco cada 4.5 segundos)
  useEffect(() => {
    if (!isPaused) {
      timeoutRef.current = setTimeout(() => {
        goToNext();
      }, 4500);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isPaused]);

  return (
    <section
      className="home-carousel-wrapper"
      aria-label="Carrusel de promociones y novedades"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="home-carousel-viewport">
        {/* Track horizontal con todos los slides */}
        <div
          className="home-carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {CAROUSEL_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className="home-carousel-slide"
              style={{ backgroundColor: slide.bgColor }}
            >
              {/* Imagen del Slide o Marcador de posición */}
              {slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="home-carousel-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="home-carousel-placeholder">
                  <div className="home-carousel-placeholder-badge">
                    <ImageIcon size={16} />
                    <span>Espacio reservado para Imagen #{slide.id}</span>
                  </div>
                </div>
              )}

              {/* Capa de contraste */}
              <div className="home-carousel-overlay" />

              {/* Contenido textual del Slide */}
              <div className="home-carousel-content">
                <span className="home-carousel-tag">{slide.tag}</span>
                <h2 className="home-carousel-title">{slide.title}</h2>
                <p className="home-carousel-subtitle">{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Flecha Anterior */}
        <button
          type="button"
          className="home-carousel-arrow prev"
          onClick={goToPrev}
          aria-label="Slide anterior"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Flecha Siguiente */}
        <button
          type="button"
          className="home-carousel-arrow next"
          onClick={goToNext}
          aria-label="Siguiente slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Indicadores de posición (Dots) */}
        <div className="home-carousel-dots">
          {CAROUSEL_SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`home-carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

