import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import '../styles/HomeCarousel.css';

/**
 * ========================================================
 * CONFIGURACIÓN DE LAS PUBLICACIONES / SLIDES DEL CARRUSEL
 * ========================================================
 * Ahora con soporte para Videos de Fondo en alta resolución (MP4)
 * con fallback a imagen y CDN para máxima velocidad de carga.
 */
const CAROUSEL_SLIDES = [
  {
    id: 1,
    tag: 'Banca Digital Astro',
    title: 'Tu futuro financiero despega con Astro Bank',
    subtitle: 'Créditos rápidos, seguros y transparentes adaptados a tus metas.',
    video: '/videos/hero-slide-1.mp4',
    fallbackVideo: 'https://videos.pexels.com/video-files/4109600/4109600-hd_1280_720_25fps.mp4',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1400&q=80',
    bgColor: '#0F172A'
  },
  {
    id: 2,
    tag: 'Créditos Personales',
    title: 'Financiamiento ágil al instante',
    subtitle: 'Solicita tu crédito en minutos sin papeleos innecesarios.',
    video: '/videos/hero-slide-2.mp4',
    fallbackVideo: 'https://videos.pexels.com/video-files/4873123/4873123-hd_1280_720_25fps.mp4',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
    bgColor: '#1E293B'
  },
  {
    id: 3,
    tag: 'Inversiones',
    title: 'Haz crecer tu patrimonio de forma segura',
    subtitle: 'Rendimientos garantizados con el respaldo que necesitas.',
    video: '/videos/hero-slide-3.mp4',
    fallbackVideo: 'https://videos.pexels.com/video-files/3196061/3196061-hd_1280_720_25fps.mp4',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
    bgColor: '#0284C7'
  }
];

export default function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);
  const videoRefs = useRef([]);

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

  // Reproducir video activo al cambiar de slide y pausar los inactivos para rendimiento óptimo
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (vid) {
        if (idx === currentIndex) {
          vid.currentTime = 0;
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [currentIndex]);

  // Efecto de cambio automático suave cada 5.5 segundos
  useEffect(() => {
    if (!isPaused) {
      timeoutRef.current = setTimeout(() => {
        goToNext();
      }, 5500);
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
              {/* Video o Imagen de Fondo */}
              {slide.video ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="home-carousel-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={slide.image}
                  onLoadedMetadata={(e) => {
                    e.currentTarget.muted = true;
                    if (index === currentIndex) {
                      e.currentTarget.play().catch(() => {});
                    }
                  }}
                >
                  <source src={slide.video} type="video/mp4" />
                  {slide.fallbackVideo && <source src={slide.fallbackVideo} type="video/mp4" />}
                  {slide.image && <img src={slide.image} alt={slide.title} className="home-carousel-img" />}
                </video>
              ) : slide.image ? (
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
                    <span>Espacio reservado para Video #{slide.id}</span>
                  </div>
                </div>
              )}

              {/* Capa oscura suave para asegurar legibilidad cinematográfica */}
              <div className="home-carousel-overlay" />

              {/* Contenido textual del Slide */}
              <div className="home-carousel-content">
                <h2 className="home-carousel-title">{slide.title}</h2>
                <p className="home-carousel-subtitle">{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navegación sutil y minimalista: flechas y burbujas sin fondo y más abajo */}
        <div className="home-carousel-controls">
          {/* Flecha Anterior */}
          <button
            type="button"
            className="home-carousel-nav-btn prev"
            onClick={goToPrev}
            aria-label="Publicación anterior"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Burbujas de Navegación (Dots) */}
          <div className="home-carousel-dots">
            {CAROUSEL_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`home-carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a publicación ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          {/* Flecha Siguiente */}
          <button
            type="button"
            className="home-carousel-nav-btn next"
            onClick={goToNext}
            aria-label="Siguiente publicación"
          >
            <ChevronRight size={15} />
          </button>
        </div>

      </div>
    </section>
  );
}
