import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltedCard (Ultra-Fluid 3D Interactive Card con Impacto Físico)
 * Incluye físicas de impacto mecánico según el punto exacto de presión:
 * al golpear o presionar un punto, esa zona se hunde en el espacio 3D (efecto balancín/tabla flotante),
 * con onda expansiva y rebote elástico al soltar.
 */
export default function TiltedCard({
  children,
  maxTilt = 22,
  impactExtraTilt = 16,
  scaleOnHover = 1.06,
  perspective = 1200,
  showGlare = true,
  showHolo = true,
  onClick,
  containerClassName = '',
  className = ''
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  // Disparar clic una sola vez por pulsación (sin depender del evento click nativo que se cancela en 3D)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  // Físicas elásticas (damping vivo para permitir un rebote elástico orgánico al soltar)
  const springTilt = { damping: 15, stiffness: 320, mass: 0.08 };
  const springElevation = { damping: 18, stiffness: 280, mass: 0.1 };
  const springShadow = { damping: 22, stiffness: 240, mass: 0.1 };

  const rotateX = useSpring(useMotionValue(0), springTilt);
  const rotateY = useSpring(useMotionValue(0), springTilt);
  const scale = useSpring(1, springElevation);
  const elevationZ = useSpring(0, springElevation);

  // Coordenadas dinámicas de iluminación especular
  const glareX = useSpring(useMotionValue(50), springTilt);
  const glareY = useSpring(useMotionValue(50), springTilt);
  const glareOpacity = useSpring(0, springElevation);

  // Sombra de proyección tridimensional
  const shadowX = useSpring(useMotionValue(0), springShadow);
  const shadowY = useSpring(useMotionValue(22), springShadow);

  // Helper para calcular coordenadas normalizadas (-1 a 1)
  const getNormalizedCoords = (clientX, clientY) => {
    if (!containerRef.current) return { normX: 0, normY: 0, px: 50, py: 50, x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const offsetX = x - rect.width / 2;
    const offsetY = y - rect.height / 2;

    const normX = Math.max(-1, Math.min(1, offsetX / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, offsetY / (rect.height / 2)));

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    return { normX, normY, px, py, x, y };
  };

  const handlePointerMove = (e) => {
    const { normX, normY, px, py } = getNormalizedCoords(e.clientX, e.clientY);

    if (isPressed) {
      // Modo Golpe/Presión: la zona presionada se hunde hacia abajo en el eje Z
      const impactForce = maxTilt + impactExtraTilt;
      rotateX.set(normY * impactForce);
      rotateY.set(-normX * impactForce);
      elevationZ.set(-35);
      scale.set(0.95);
      shadowX.set(-normX * 8);
      shadowY.set(12 + normY * 6);
    } else {
      // Modo Flotación: el cursor atrae la inclinación hacia el observador
      rotateX.set(-normY * maxTilt);
      rotateY.set(normX * maxTilt);
      if (isHovered) {
        elevationZ.set(55);
        scale.set(scaleOnHover);
      }
      shadowX.set(-normX * 24);
      shadowY.set(28 - normY * 18);
    }

    glareX.set(px);
    glareY.set(py);
  };

  // Al presionar la tarjeta (Click o Touch)
  const handlePointerDown = (e) => {
    setIsPressed(true);
    onClick?.(e);
    const { normX, normY, x, y, px, py } = getNormalizedCoords(e.clientX, e.clientY);

    // Hundir fuertemente el punto donde se hace presión (efecto golpe físico hacia abajo)
    const impactForce = maxTilt + impactExtraTilt;
    rotateX.set(normY * impactForce);
    rotateY.set(-normX * impactForce);
    elevationZ.set(-35);
    scale.set(0.94);
    shadowX.set(-normX * 8);
    shadowY.set(10 + normY * 6);

    glareX.set(px);
    glareY.set(py);
    glareOpacity.set(0.95);

    // Disparar onda expansiva de impacto en el punto presionado
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev.slice(-3), newRipple]);
  };

  // Al soltar la presión (Rebote elástico)
  const handlePointerUp = (e) => {
    setIsPressed(false);
    const { normX, normY } = getNormalizedCoords(e.clientX, e.clientY);

    if (isHovered) {
      // Regresar al modo de flotación en hover con rebote vivo
      rotateX.set(-normY * maxTilt);
      rotateY.set(normX * maxTilt);
      elevationZ.set(55);
      scale.set(scaleOnHover);
      shadowX.set(-normX * 24);
      shadowY.set(28 - normY * 18);
      glareOpacity.set(0.85);
    } else {
      rotateX.set(0);
      rotateY.set(0);
      elevationZ.set(0);
      scale.set(1);
      shadowX.set(0);
      shadowY.set(22);
      glareOpacity.set(0);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!isPressed) {
      scale.set(scaleOnHover);
      elevationZ.set(55);
      glareOpacity.set(0.85);
    }
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    if (!isPressed) {
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
      elevationZ.set(0);
      shadowX.set(0);
      shadowY.set(22);
      glareX.set(50);
      glareY.set(50);
      glareOpacity.set(0);
    }
  };

  // Asegurar que si el puntero se suelta fuera de la ventana, se libere la presión
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPressed) {
        setIsPressed(false);
        if (!isHovered) {
          rotateX.set(0);
          rotateY.set(0);
          elevationZ.set(0);
          scale.set(1);
        }
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [isPressed, isHovered]);

  // Limpiar ondas expansivas tras finalizar su animación
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => Date.now() - r.id < 600));
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // Ángulo de refracción holográfica que varía según la inclinación
  const holoAngle = useTransform(
    [rotateX, rotateY],
    ([rx, ry]) => 55 + ry * 2.8 + rx * 2.2
  );

  // Capa 1: Brillo especular nítido
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle 320px at ${gx}% ${gy}%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`
  );

  // Capa 2: Brillo holográfico iridiscente
  const holoBackground = useTransform(
    holoAngle,
    (angle) =>
      `linear-gradient(${angle}deg, rgba(255, 0, 128, 0.15) 0%, rgba(0, 210, 255, 0.28) 25%, rgba(255, 255, 255, 0.38) 50%, rgba(0, 255, 180, 0.22) 75%, rgba(120, 0, 255, 0.18) 100%)`
  );

  // Sombra de levitación espacial multicapa reactiva
  const dynamicBoxShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) =>
      `${sx}px ${sy}px 55px -8px rgba(0, 0, 60, 0.55), ` +
      `${sx * 0.6}px ${sy * 0.6}px 30px -4px rgba(0, 102, 255, 0.4), ` +
      `0 0 45px rgba(0, 210, 255, 0.28)`
  );

  return (
    <div
      className={`tilted-card-outer-wrapper ${containerClassName}`}
      style={{ perspective: `${perspective}px` }}
    >
      {/* Contenedor de Levitación Ambiental continua (animado con Framer Motion) */}
      <motion.div
        className="tilted-card-levitation"
        animate={
          isPressed
            ? { y: 6, rotateZ: 0 }
            : isHovered
            ? { y: -10, rotateZ: 0 }
            : { y: [0, -14, 0], rotateZ: [0, 1.2, -0.8, 0] }
        }
        transition={
          isPressed || isHovered
            ? { type: 'spring', damping: 20, stiffness: 260 }
            : { repeat: Infinity, duration: 6, ease: 'easeInOut' }
        }
      >
        <motion.div
          ref={containerRef}
          className={`tilted-card-inner ${className}`}
          tabIndex={onClick ? 0 : undefined}
          role={onClick ? 'button' : undefined}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onKeyDown={onClick ? handleKeyDown : undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            scale,
            z: elevationZ,
            boxShadow: dynamicBoxShadow,
            transformStyle: 'preserve-3d',
            cursor: isPressed ? 'grabbing' : 'pointer',
            backgroundColor: '#060B1E',
            borderRadius: 22,
            overflow: 'hidden'
          }}
        >
          {/* Contenido principal (Tarjeta de Crédito que llena el 100%) */}
          <div
            className="tilted-card-content"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              transformStyle: 'preserve-3d'
            }}
          >
            {children}
          </div>

          {/* Ondas de choque en el punto exacto presionado */}
          {ripples.map((r) => (
            <span
              key={r.id}
              className="tilted-card-impact-ripple"
              style={{ left: r.x, top: r.y }}
              aria-hidden="true"
            />
          ))}

          {/* Capa 1: Reflejo especular que sigue al cursor */}
          {showGlare && (
            <motion.div
              className="tilted-card-glare"
              style={{
                opacity: glareOpacity,
                background: glareBackground,
                transform: 'translateZ(50px)',
                pointerEvents: 'none',
                mixBlendMode: 'overlay'
              }}
              aria-hidden="true"
            />
          )}

          {/* Capa 2: Refracción holográfica iridiscente */}
          {showHolo && (
            <motion.div
              className="tilted-card-holo"
              style={{
                opacity: glareOpacity,
                background: holoBackground,
                transform: 'translateZ(52px)',
                pointerEvents: 'none',
                mixBlendMode: 'color-dodge'
              }}
              aria-hidden="true"
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
