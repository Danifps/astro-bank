import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, TrendingUp, HandCoins, Umbrella, ArrowRight, X, Check } from 'lucide-react';
import '../styles/QuickNeeds.css';

const NEEDS_ITEMS = [
  {
    id: 1,
    title: 'Una Cuenta',
    icon: Wallet,
    eyebrow: 'Banca Personas',
    description: 'Abre tu cuenta digital en minutos y gestiona tu línea de crédito, pagos móviles y transferencias desde un solo lugar.',
    highlights: [
      'Registro progresivo en 6 pasos simples',
      'Acceso inmediato a Billetera General y Financiamiento',
      'Control en tiempo real de movimientos y cuotas'
    ],
    ctaLabel: 'Ir a Registro',
    ctaTo: '/registro'
  },
  {
    id: 2,
    title: 'Una Tarjeta',
    icon: CreditCard,
    eyebrow: 'Medios de Pago',
    description: 'Utiliza tu línea de crédito en comercios aliados de tecnología, hogar, moda, servicios y bienestar con cuotas claras.',
    highlights: [
      'Respaldo sobre tu Línea General disponible',
      'Compras financiadas en comercios aliados',
      'Seguimiento de consumos y fechas de corte'
    ],
    ctaLabel: 'Solicitar ahora',
    ctaTo: '/registro'
  },
  {
    id: 3,
    title: 'Productos de Inversión',
    icon: TrendingUp,
    eyebrow: 'Portal Inversionistas',
    description: 'Participa en el ecosistema de banca distribuida respaldando líneas de crédito con visibilidad sobre rendimiento y trazabilidad.',
    highlights: [
      'Portal dedicado para perfil Inversionista',
      'Diversificación entre líneas generales y plazos fijos',
      'Monitoreo de evolución semestral y retorno'
    ],
    ctaLabel: 'Ver información para Inversionistas',
    ctaTo: '/para-inversionistas'
  },
  {
    id: 4,
    title: 'Financiamiento',
    icon: HandCoins,
    eyebrow: 'Soluciones de Crédito',
    description: 'Accede a planes de financiamiento a mediano plazo o crédito rotativo adaptados a tus proyectos personales.',
    highlights: [
      'Plazos definidos de 6 o 12 cuotas',
      'Tasa de referencia clara desde la solicitud',
      'Abonos rápidos por Pagomóvil, transferencia o débito'
    ],
    ctaLabel: 'Explorar Soluciones de Crédito',
    ctaTo: '/soluciones-de-credito'
  },
  {
    id: 5,
    title: 'Un Seguro',
    icon: Umbrella,
    eyebrow: 'Protección y Respaldo',
    description: 'Resguarda tus compromisos crediticios y operaciones digitales con coberturas diseñadas para darte tranquilidad.',
    highlights: [
      'Protección sobre saldo pendiente de crédito',
      'Resguardo de operaciones y transferencias digitales',
      'Trazabilidad y soporte ante imprevistos'
    ],
    ctaLabel: 'Ver detalles de Seguros',
    ctaTo: '/seguros'
  }
];

export default function QuickNeeds() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsEntered(true);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!selectedItem) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  const handleModalNavigate = (to) => {
    setSelectedItem(null);
    navigate(to);
  };

  const SelectedIcon = selectedItem?.icon;

  return (
    <section
      ref={sectionRef}
      className={`quick-needs-section ${isVisible ? 'visible' : ''} ${isEntered ? 'entered' : ''}`}
      aria-label="Accesos rápidos a productos"
    >
      <div className="quick-needs-container">
        <div className="quick-needs-header">
          <h2 className="quick-needs-title">Cuéntanos, ¿qué necesitas?</h2>
        </div>

        <div className="quick-needs-grid">
          {NEEDS_ITEMS.map((item, index) => {
            const IconComponent = item.icon;
            const style = { '--entrance-delay': `${index * 80}ms` };

            return (
              <button
                key={item.id}
                type="button"
                className="quick-needs-card"
                style={style}
                onClick={() => setSelectedItem(item)}
                title={`Ver más sobre ${item.title}`}
              >
                <div className="quick-needs-icon-wrapper">
                  <IconComponent size={26} strokeWidth={2} />
                </div>

                <h3 className="quick-needs-card-title">{item.title}</h3>

                <div className="quick-needs-arrow-row">
                  <span className="quick-needs-arrow-btn">
                    <ArrowRight size={18} strokeWidth={2.2} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedItem && (
        <div
          className="quick-needs-modal-backdrop"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-needs-modal-title"
        >
          <div
            className="quick-needs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="quick-needs-modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Cerrar ventana"
            >
              <X size={20} />
            </button>

            <div className="quick-needs-modal-header">
              <div className="quick-needs-modal-icon">
                {SelectedIcon && <SelectedIcon size={24} strokeWidth={2} />}
              </div>
              <div>
                <span className="quick-needs-modal-eyebrow">{selectedItem.eyebrow}</span>
                <h3 id="quick-needs-modal-title" className="quick-needs-modal-title">
                  {selectedItem.title}
                </h3>
              </div>
            </div>

            <p className="quick-needs-modal-desc">{selectedItem.description}</p>

            <ul className="quick-needs-modal-list">
              {selectedItem.highlights.map((point) => (
                <li key={point}>
                  <Check size={16} className="quick-needs-modal-check" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="quick-needs-modal-actions">
              <button
                type="button"
                className="quick-needs-modal-btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="quick-needs-modal-btn-primary"
                onClick={() => handleModalNavigate(selectedItem.ctaTo)}
              >
                <span>{selectedItem.ctaLabel}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
