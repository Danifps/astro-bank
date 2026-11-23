import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import '../styles/CardsCarousel.css';

/**
 * ========================================================
 * LISTA DE TARJETAS / CATEGORÍAS DEL CARRUSEL
 * ========================================================
 * Para agregar tus imágenes:
 * Coloca la ruta de tu foto en la propiedad 'image' de cada tarjeta.
 * Ejemplo: image: '/src/assets/tecnologia.jpg'
 */
const CARDS_DATA = [
  {
    id: 1,
    name: 'Tecnología',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #1E293B, #0F172A)'
  },
  {
    id: 2,
    name: 'Servicios',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #1E3A8A, #172554)'
  },
  {
    id: 3,
    name: 'Departamental',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #0369A1, #082F49)'
  },
  {
    id: 4,
    name: 'Hogar',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #0F766E, #042F2E)'
  },
  {
    id: 5,
    name: 'Moda',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #4338CA, #1E1B4B)'
  },
  {
    id: 6,
    name: 'Salud y Bienestar',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #0284C7, #075985)'
  },
  {
    id: 7,
    name: 'Supermercados',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #334155, #1E293B)'
  },
  {
    id: 8,
    name: 'Viajes',
    image: '', // <-- Agrega tu imagen aquí
    bgColor: 'linear-gradient(145deg, #1D4ED8, #1E40AF)'
  }
];

export default function CardsCarousel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Detección de scroll para animación de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Movimiento automático suave paso a paso del carrusel
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (trackRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
        // Si llega al final del track, regresa suavemente al inicio
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          trackRef.current.scrollBy({ left: 252, behavior: 'smooth' });
        }
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Navegación manual con las flechas
  const handleScroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`cards-carousel-section ${isVisible ? 'visible' : ''}`}
      aria-label="Con Astro Bank alcanzas todo lo que necesitas"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="cards-carousel-container">
        
        {/* Título de la sección */}
        <div className="cards-carousel-header">
          <h2 className="cards-carousel-title">
            Con Astro Bank alcanzas todo lo que necesitas
          </h2>
        </div>

        {/* Viewport del carrusel con flechas de navegación */}
        <div className="cards-carousel-viewport">
          
          {/* Flecha Izquierda */}
          <button
            type="button"
            className="cards-carousel-nav-btn prev"
            onClick={() => handleScroll('left')}
            aria-label="Ver tarjetas anteriores"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Track horizontal de tarjetas */}
          <div className="cards-carousel-track" ref={trackRef}>
            {CARDS_DATA.map((card) => (
              <div
                key={card.id}
                className="category-card"
                style={{ background: card.bgColor }}
              >
                {/* Imagen o Placeholder "Foto" */}
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    className="category-card-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="category-card-placeholder">
                    <ImageIcon size={32} />
                    <span className="category-card-placeholder-text">Foto</span>
                  </div>
                )}

                {/* Sombreado inferior de contraste */}
                <div className="category-card-overlay" />

                {/* Texto pequeño en la zona inferior izquierda según el boceto */}
                <span className="category-card-label">{card.name}</span>
              </div>
            ))}
          </div>

          {/* Flecha Derecha */}
          <button
            type="button"
            className="cards-carousel-nav-btn next"
            onClick={() => handleScroll('right')}
            aria-label="Ver tarjetas siguientes"
          >
            <ChevronRight size={24} />
          </button>
        </div>

      </div>
    </section>
  );
}

