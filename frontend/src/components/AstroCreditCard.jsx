import React from 'react';
import '../styles/AstroCreditCard.css';

/**
 * AstroCreditCard
 * Modelo realista y premium de Tarjeta de Crédito Astro Bank con acabado espacial a todo color,
 * chip EMV metálico, símbolo Contactless, tipografía en relieve y capas con profundidad 3D.
 */
export default function AstroCreditCard({
  cardNumber = '0000  0000  0000  0000',
  cardHolder = 'DANIEL MORALES',
  expiryDate = '08/29'
}) {
  return (
    <div
      className="astro-card-body"
      role="img"
      aria-label="Tarjeta de Crédito Astro Bank"
    >
      {/* 1. Fondo cósmico a todo color con rejilla y brillos holográficos */}
      <div className="astro-card-bg-gradient" />
      <div className="astro-card-mesh-pattern" />
      <div className="astro-card-starlight-glow" />

      {/* 2. Cabecera: Logotipo Astro Bank con estrella y símbolo contactless */}
      <div className="astro-card-layer-header">
        <div className="astro-card-brand">
          <div className="astro-card-logo-sparkle" aria-hidden="true">
            {/* Estrella de 4 puntas de Astro Bank */}
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
            </svg>
          </div>
          <span className="astro-card-brand-name">Astro Bank</span>
        </div>

        {/* Símbolo Contactless / Pago sin contacto en cabecera */}
        <div className="astro-card-contactless" title="Pago Contactless">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M7 4a12 12 0 0 1 0 16" />
            <path d="M11 7a7 7 0 0 1 0 10" />
            <path d="M15 10a3 3 0 0 1 0 4" />
          </svg>
        </div>
      </div>

      {/* 3. Chip EMV metálico con circuito grabado */}
      <div className="astro-card-layer-chip-row">
        <div className="astro-card-emv-chip" title="Chip EMV de seguridad">
          <div className="emv-chip-line emv-chip-line-horizontal" />
          <div className="emv-chip-line emv-chip-line-vertical" />
          <div className="emv-chip-center-core" />
        </div>
      </div>

      {/* 4. Número de tarjeta en relieve metálico */}
      <div className="astro-card-layer-number">
        <span className="astro-card-digits" key={cardNumber}>{cardNumber}</span>
      </div>

      {/* 5. Pie de tarjeta: Titular (DANIEL MORALES), Fecha de Expiración y Holograma de Red */}
      <div className="astro-card-layer-footer">
        {/* Titular */}
        <div className="astro-card-meta-col">
          <span className="astro-card-meta-label">TITULAR</span>
          <span className="astro-card-meta-value astro-card-holder-name">{cardHolder}</span>
        </div>

        {/* Vencimiento */}
        <div className="astro-card-meta-col">
          <span className="astro-card-meta-label">VENCE</span>
          <span className="astro-card-meta-value astro-card-expiry-date">{expiryDate}</span>
        </div>

        {/* Emblema holográfico de red de pago (Esferas duales AstroPay) */}
        <div className="astro-card-network-badge" title="AstroPay Global Network">
          <div className="network-circle network-circle-left" />
          <div className="network-circle network-circle-right" />
        </div>
      </div>

      {/* 6. Borde perimetral con micro-resplandor metálico */}
      <div className="astro-card-edge-highlight" aria-hidden="true" />
    </div>
  );
}
