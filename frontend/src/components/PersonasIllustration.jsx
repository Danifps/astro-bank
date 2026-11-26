import { ArrowDownLeft, ShieldCheck } from 'lucide-react';
import AstroCreditCard from './AstroCreditCard';
import '../styles/AuthIllustrations.css';

export default function PersonasIllustration() {
  return (
    <div className="auth-illustration-wrapper" aria-hidden="true">
      {/* Resplandor ambiental de fondo */}
      <div className="illustration-ambient-glow" />

      <div className="illustration-composition">
        
        {/* Widget Superior: Transferencia Recibida (Levitando) */}
        <div className="floating-widget widget-transfer">
          <div className="widget-icon-box success">
            <ArrowDownLeft size={20} strokeWidth={2.5} />
          </div>
          <div className="widget-text-col">
            <span className="widget-title">Transferencia Recibida</span>
            <span className="widget-amount">+$1,450.00 USD</span>
          </div>
        </div>

        {/* Tarjeta de Crédito Astro Bank (Levitando en 3D) */}
        <div className="personas-static-card-wrapper">
          <AstroCreditCard
            cardNumber="0000  0000  0000  0000"
            cardHolder="DANIEL MORALES"
            expiryDate="08/29"
          />
        </div>

        {/* Widget Inferior: Seguridad Biométrica (Levitando) */}
        <div className="floating-widget widget-security">
          <div className="widget-icon-box primary">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div className="widget-text-col">
            <span className="widget-security-text">Protección Bancaria Activa</span>
            <span className="widget-security-sub">Cifrado de 256 bits y Biometría</span>
          </div>
        </div>

      </div>
    </div>
  );
}
