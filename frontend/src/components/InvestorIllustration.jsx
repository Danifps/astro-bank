import { TrendingUp, DollarSign, Award, Layers } from 'lucide-react';
import '../styles/AuthIllustrations.css';

export default function InvestorIllustration() {
  return (
    <div className="auth-illustration-wrapper" aria-hidden="true">
      {/* Resplandor ambiental de fondo */}
      <div className="illustration-ambient-glow" />

      <div className="illustration-composition">
        
        {/* Widget Flotante Superior: Retornos/Dividendos Inversor */}
        <div className="floating-widget widget-investor-dividend">
          <div className="widget-icon-box success">
            <DollarSign size={20} strokeWidth={2.5} />
          </div>
          <div className="widget-text-col">
            <span className="widget-title">Rendimiento Liquidado</span>
            <span className="widget-amount">+$4,280.00 USD</span>
          </div>
        </div>

        {/* Tarjeta Central: Dashboard de Portafolio y Gráfico de Rendimiento */}
        <div className="investor-chart-card">
          <div className="chart-header">
            <div className="chart-title-area">
              <span className="chart-category">Portafolio Inversionista</span>
              <span className="chart-value">$248,500.00 <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>USD</span></span>
            </div>
            <div className="chart-badge-yield">
              <TrendingUp size={14} strokeWidth={2.5} />
              <span>+24.8% YTD</span>
            </div>
          </div>

          {/* Gráfico Vectorial Curva de Crecimiento */}
          <div className="svg-chart-container">
            <svg viewBox="0 0 300 90" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0000FF" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#00D2FF" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0000FF" />
                  <stop offset="50%" stopColor="#0066FF" />
                  <stop offset="100%" stopColor="#00D2FF" />
                </linearGradient>
              </defs>

              {/* Líneas guía sutiles */}
              <line x1="0" y1="25" x2="300" y2="25" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="0" y1="55" x2="300" y2="55" stroke="#F1F5F9" strokeDasharray="3 3" />

              {/* Área sombreada */}
              <path
                d="M 0,75 Q 40,65 75,50 T 150,42 T 225,25 T 300,10 L 300,90 L 0,90 Z"
                fill="url(#chartGradient)"
              />

              {/* Línea principal de rendimiento */}
              <path
                d="M 0,75 Q 40,65 75,50 T 150,42 T 225,25 T 300,10"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Punto de pico activo */}
              <circle cx="300" cy="10" r="5" fill="#00D2FF" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Distribución de Activos */}
          <div className="asset-distribution-row">
            <div className="asset-pill">
              <span className="asset-dot blue" />
              <span>Renta Fija 45%</span>
            </div>
            <div className="asset-pill">
              <span className="asset-dot cyan" />
              <span>Fondos 35%</span>
            </div>
            <div className="asset-pill">
              <span className="asset-dot green" />
              <span>Liquidez 20%</span>
            </div>
          </div>
        </div>

        {/* Widget Flotante Inferior: Certificación Institucional */}
        <div className="floating-widget widget-investor-badge">
          <div className="widget-icon-box primary">
            <Award size={20} strokeWidth={2.5} />
          </div>
          <div className="widget-text-col">
            <span className="widget-security-text">Custodia Institucional AAA</span>
            <span className="widget-security-sub">Auditoría y Supervisión Continua</span>
          </div>
        </div>

      </div>
    </div>
  );
}
