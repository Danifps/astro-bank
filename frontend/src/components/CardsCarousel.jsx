import { useState, useEffect, useRef } from 'react';
import '../styles/CardsCarousel.css';

/**
 * ========================================================
 * LISTA DE TARJETAS / CATEGORÍAS DEL CARRUSEL (EXHIBICIÓN 100%)
 * ========================================================
 * Contienen fotografías de alta calidad para cada categoría,
 * sin interacciones de puntero (cursor default) y en loop continuo.
 */
const CARDS_DATA = [
  {
    id: 1,
    name: 'Tecnología',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #1E293B, #0F172A)'
  },
  {
    id: 2,
    name: 'Servicios',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #1E3A8A, #172554)'
  },
  {
    id: 3,
    name: 'Departamental',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #0369A1, #082F49)'
  },
  {
    id: 4,
    name: 'Hogar',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #0F766E, #042F2E)'
  },
  {
    id: 5,
    name: 'Moda',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #4338CA, #1E1B4B)'
  },
  {
    id: 6,
    name: 'Salud y Bienestar',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #0284C7, #075985)'
  },
  {
    id: 7,
    name: 'Supermercados',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #334155, #1E293B)'
  },
  {
    id: 8,
    name: 'Viajes',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    bgColor: 'linear-gradient(145deg, #1D4ED8, #1E40AF)'
  }
];

// Duplicamos las tarjetas para lograr el efecto de carrusel infinito continuo sin saltos
const INFINITE_CARDS = [...CARDS_DATA, ...CARDS_DATA];

export default function CardsCarousel() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  return (
    <section
      id="tarjetas"
      ref={sectionRef}
      className={`cards-carousel-section ${isVisible ? 'visible' : ''}`}
      aria-label="Con Astro Bank alcanzas todo lo que necesitas"
    >
      <div className="cards-carousel-container">
        
        {/* Título de la sección */}
        <div className="cards-carousel-header">
          <h2 className="cards-carousel-title">
            Con Astro Bank alcanzas todo lo que necesitas
          </h2>
        </div>

        {/* Viewport de exhibición al 100% de lado a lado */}
        <div className="cards-carousel-viewport">
          
          {/* Track infinito continuo sin interacciones ni flechas */}
          <div className="cards-carousel-infinite-track">
            {INFINITE_CARDS.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="category-card"
                style={{ background: card.bgColor }}
                aria-hidden={index >= CARDS_DATA.length}
              >
                {/* Fotografía de alta calidad */}
                <img
                  src={card.image}
                  alt={card.name}
                  className="category-card-img"
                  loading="lazy"
                  draggable="false"
                />

                {/* Sombreado de contraste para la etiqueta */}
                <div className="category-card-overlay" />

                {/* Nombre de la categoría en la parte inferior */}
                <span className="category-card-label">{card.name}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
