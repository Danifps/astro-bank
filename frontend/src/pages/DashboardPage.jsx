import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  CreditCard,
  Receipt,
  ArrowLeftRight,
  History,
  LogOut,
  Bell,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Menu,
  X,
  Clock,
  Check,
  FileText,
  PanelLeft
} from 'lucide-react';
import logotipoImg from '../assets/logotipo.png';
import logoPhotoroomImg from '../assets/logo-Photoroom.png';
import '../styles/Dashboard.css';

/**
 * Retorna el saludo dinámico según la hora actual del servidor / cliente:
 * - 05:00 a 11:59: "Buenos días"
 * - 12:00 a 18:59: "Buenas tardes"
 * - 19:00 a 04:59: "Buenas noches"
 */
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Buenos días';
  } else if (hour >= 12 && hour < 19) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
};

/**
 * Mini gráfica financiera de evolución de saldo / uso de crédito
 * ubicada en el espacio en blanco de la tarjeta "Mi Crédito Activo" por encima de la barra de progreso.
 */
function CreditSparkline({ tab = 'general' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const months = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];
  const values = tab === 'general'
    ? [142000, 185000, 168000, 215000, 202000, 243234.32]
    : [620000, 710000, 680000, 840000, 920000, 1006698.32];

  const min = Math.min(...values) * 0.85;
  const max = Math.max(...values) * 1.08;
  const w = 520;
  const h = 110;
  const topPad = 12;
  const bottomPad = 10;

  const points = values.map((v, i) => {
    const x = 18 + (i / (values.length - 1)) * (w - 36);
    const y = topPad + (1 - (v - min) / (max - min)) * (h - topPad - bottomPad);
    return {
      x,
      y,
      xPct: (x / w) * 100,
      yPct: (y / h) * 100,
      v,
      m: months[i]
    };
  });

  // Construcción de curva bezier cúbica suave
  let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${h} L ${points[0].x.toFixed(1)} ${h} Z`;

  return (
    <div className="credit-sparkline-wrap">
      <div className="credit-sparkline-meta">
        <span className="credit-sparkline-badge">
          {tab === 'general' ? '+14.2%' : '+21.5%'}
        </span>
      </div>

      <div className="credit-sparkline-chart-area">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="credit-sparkline-svg"
          preserveAspectRatio="none"
          aria-label="Gráfica de evolución de saldo"
        >
          <defs>
            <linearGradient id={`sparklineGrad-${tab}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0000FF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0000FF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas guía punteadas horizontales */}
          <line x1="10" y1={h * 0.30} x2={w - 10} y2={h * 0.30} stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="10" y1={h * 0.66} x2={w - 10} y2={h * 0.66} stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          {/* Área sombreada con gradiente */}
          <path d={areaD} fill={`url(#sparklineGrad-${tab})`} />

          {/* Línea de tendencia con grosor uniforme */}
          <path
            d={pathD}
            fill="none"
            stroke="#0000FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Puntos HTML circulares sin deformación y zonas interactivas */}
        {points.map((pt, idx) => {
          const isHovered = hoveredIndex === idx;
          const isLast = idx === points.length - 1;
          return (
            <div
              key={pt.m}
              className="credit-sparkline-hit-zone"
              style={{ left: `${pt.xPct}%` }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && <div className="credit-sparkline-vguide" />}
              {(isHovered || isLast) && (
                <span
                  className={`credit-sparkline-dot ${isHovered ? 'hovered' : ''}`}
                  style={{ top: `${pt.yPct}%` }}
                />
              )}
            </div>
          );
        })}

        {hoveredIndex !== null && (
          <div
            className="credit-sparkline-tooltip"
            style={{
              left: `${points[hoveredIndex].xPct}%`,
              top: `${points[hoveredIndex].yPct}%`
            }}
          >
            <span>{points[hoveredIndex].m}: </span>
            <strong>Bs {points[hoveredIndex].v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        )}
      </div>

      {/* Etiquetas de meses en HTML nítido sin estiramiento */}
      <div className="credit-sparkline-labels-row">
        {points.map((pt, idx) => {
          const isHovered = hoveredIndex === idx;
          const isLast = idx === points.length - 1;
          return (
            <span
              key={pt.m}
              className={`credit-sparkline-label ${isHovered || isLast ? 'active' : ''}`}
              style={{ left: `${pt.xPct}%` }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {pt.m}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Cuotas pendientes para Registrar Pago según boceto
const PENDING_CUOTAS = [
  {
    solicitud: '56201598734',
    fechaCorte: '03/12/2026',
    tipo: 'Financiamiento',
    cuotas: '0/12',
    montoPagar: 'BS 104.405,80'
  },
  {
    solicitud: '47899614837',
    fechaCorte: '25/11/2026',
    tipo: 'Producto',
    cuotas: '2/6',
    montoPagar: 'BS 20.055,77'
  },
  {
    solicitud: '56201598739',
    fechaCorte: '05/12/2026',
    tipo: 'Línea General',
    cuotas: '-',
    montoPagar: 'BS 11.000,00'
  }
];

// Datos de solicitudes de crédito según el boceto
const INITIAL_CREDIT_REQUESTS = [
  {
    id: 1,
    solicitudId: '56201598739',
    fechaCorte: '05/12/2026',
    fechaSolicitado: '05/12/2026',
    tipo: 'Línea General',
    montoPagar: 'Bs 11.000,00',
    cuotas: '-',
    estado: 'ENVIADO',
    tasa: '16.5% anual',
    limiteTotal: 'Bs 50.000,00',
    descripcion: 'Línea de crédito rotativa para consumos y transferencias.'
  },
  {
    id: 2,
    solicitudId: '45698217689',
    fechaCorte: '03/12/2026',
    fechaSolicitado: '03/12/2026',
    tipo: 'Financiamiento',
    montoPagar: 'BS 104.405,80',
    cuotas: '0/12',
    estado: 'En revisión',
    tasa: '14.0% fija',
    limiteTotal: 'Bs 240.000,00',
    descripcion: 'Financiamiento a mediano plazo para inversión personal.'
  },
  {
    id: 3,
    solicitudId: '47899614837',
    fechaCorte: '23/11/2026',
    fechaSolicitado: '23/11/2026',
    tipo: 'Producto',
    montoPagar: 'BS 20.058,77',
    cuotas: '2/6',
    estado: 'Aprobado',
    tasa: '12.0% fija',
    limiteTotal: 'Bs 60.000,00',
    descripcion: 'Compra financiada en comercio aliado Astro Bank.'
  }
];

// Datos iniciales de últimos movimientos
const RECENT_TRANSACTIONS = [
  {
    id: '84920194821',
    fecha: '18/11/2026',
    hora: '14:32',
    tipo: 'Pago Móvil hacia otro banco',
    monto: '- Bs 1.250,00',
    flujo: 'egreso'
  },
  {
    id: '60381928405',
    fecha: '15/11/2026',
    hora: '09:15',
    tipo: 'Abono Cuota Financiamiento',
    monto: '+ Bs 20.000,00',
    flujo: 'ingreso'
  },
  {
    id: '48291048291',
    fecha: '10/11/2026',
    hora: '18:40',
    tipo: 'Consumo Punto de Venta',
    monto: '- Bs 3.420,50',
    flujo: 'egreso'
  },
  {
    id: '71048291038',
    fecha: '05/11/2026',
    hora: '11:05',
    tipo: 'Transferencia Inmediata',
    monto: '+ Bs 15.000,00',
    flujo: 'ingreso'
  }
];

// Datos iniciales para Historial de Movimientos según boceto
const INITIAL_HISTORIAL_MOVIMIENTOS = [
  {
    id: 1,
    comprobante: '56201598734',
    fecha: '05/12/2026',
    hora: '11:18 AM',
    estado: 'Transacción',
    monto: '5.562,32 BS.',
    flujo: 'egreso',
    canal: 'Pago Móvil hacia otro banco',
    bancoDestino: '0102 - Banco de Venezuela',
    beneficiario: 'V-24890123',
    concepto: 'Pago de servicios y consumo comercial'
  },
  {
    id: 2,
    comprobante: '45698217684',
    fecha: '03/12/2026',
    hora: '02:15 PM',
    estado: 'Registro de Pago',
    monto: '10.002,72 BS.',
    flujo: 'ingreso',
    canal: 'Abono Cuota Financiamiento',
    bancoDestino: '0108 - BBVA Provincial',
    beneficiario: 'Astro Bank Débito en Cuenta',
    concepto: 'Cuota ordinaria préstamo personal'
  },
  {
    id: 3,
    comprobante: '47899614837',
    fecha: '23/11/2026',
    hora: '09:34 PM',
    estado: 'Crédito',
    monto: '12.835,67 BS.',
    flujo: 'ingreso',
    canal: 'Desembolso Línea de Crédito',
    bancoDestino: 'Astro Bank Billetera General',
    beneficiario: 'Enyerbert Daniel Morales Ramirez',
    concepto: 'Liquidación de crédito rotativo aprobado'
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();

  // Estados interactivos principales
  const [activeNav, setActiveNav] = useState('inicio');

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeNav]);
  const [creditTab, setCreditTab] = useState('general'); // 'general' | 'financiamiento'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Datos del usuario actual logueado
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('astro_user');
      return stored ? JSON.parse(stored) : {
        nombre: 'Daniel Morales',
        perfil: 'Personas'
      };
    } catch {
      return {
        nombre: 'Daniel Morales',
        perfil: 'Personas'
      };
    }
  });

  const getUserDisplayName = () => {
    if (!currentUser?.nombre) return 'Daniel Morales';
    if (currentUser.nombre.includes('Daniel Morales')) return 'Daniel Morales';
    return currentUser.nombre.split(' ').slice(0, 2).join(' ');
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Estados de solicitudes de crédito
  const [creditList, setCreditList] = useState(INITIAL_CREDIT_REQUESTS);
  const [solicitarModalOpen, setSolicitarModalOpen] = useState(false);
  const [solicitarSuccess, setSolicitarSuccess] = useState(false);
  const [newCreditData, setNewCreditData] = useState({
    tipo: 'Financiamiento',
    monto: '50000',
    plazo: '12',
    destino: 'Inversión personal / remodelación'
  });

  // Estados de pago y detalle
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);

  // Estados para Registrar Pago (según boceto)
  const [selectedCuota, setSelectedCuota] = useState(PENDING_CUOTAS[0]);
  const [cuotaDropdownOpen, setCuotaDropdownOpen] = useState(false);
  const [metodoPago, setMetodoPago] = useState('pagomovil');
  const [bancoRemitente, setBancoRemitente] = useState('Banco de Venezuela');
  const [referenciaBancaria, setReferenciaBancaria] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const fileInputRef = useRef(null);
  const cuotaDropdownRef = useRef(null);

  // Datos del comprobante de Registrar Pago (11 dígitos)
  const [voucherData, setVoucherData] = useState({
    comprobante: '84920194821',
    fechaHora: '24/11/2026 - 10:45 AM',
    metodoTexto: 'Pagomóvil',
    referencia: '84920194821',
    bancoOrigen: 'Banco de Venezuela',
    monto: 'BS 104.405,80',
    solicitud: '56201598734'
  });

  // Estados para Transacción (según boceto)
  const [txCuenta, setTxCuenta] = useState('linea-general'); // 'linea-general' | 'financiamiento'
  const [txMetodo, setTxMetodo] = useState('pagomovil');
  const [txOperacion, setTxOperacion] = useState('p2p');
  const [txDocTipo, setTxDocTipo] = useState('V');
  const [txDocNum, setTxDocNum] = useState('');
  const [txBanco, setTxBanco] = useState('0102 - Banco de Venezuela');
  const [txTelefono, setTxTelefono] = useState('');
  const [txMonto, setTxMonto] = useState('');
  const [txConcepto, setTxConcepto] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);
  const [txVoucher, setTxVoucher] = useState(null);

  // Lista de movimientos en vivo
  const [movementsList, setMovementsList] = useState(RECENT_TRANSACTIONS);

  // Estados para Historial de Movimientos (según boceto)
  const [historialList, setHistorialList] = useState(INITIAL_HISTORIAL_MOVIMIENTOS);
  const [selectedMovement, setSelectedMovement] = useState(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (cuotaDropdownRef.current && !cuotaDropdownRef.current.contains(event.target)) {
        setCuotaDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprobanteFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setComprobantePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setComprobantePreview(null);
      }
    }
  };

  const removeComprobante = (e) => {
    e.stopPropagation();
    setComprobanteFile(null);
    setComprobantePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleComprobarPago = (e) => {
    e.preventDefault();
    if (!referenciaBancaria.trim()) {
      alert('Por favor ingresa la referencia bancaria.');
      return;
    }
    const random11Digits = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const now = new Date();
    const fechaHoraStr = `${now.toLocaleDateString('es-VE')} - ${now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`;

    let metodoTexto = 'Pagomóvil';
    if (metodoPago === 'transferencia') metodoTexto = 'Transferencia Bancaria';
    if (metodoPago === 'debito') metodoTexto = 'Débito en Cuenta Corriente';

    setVoucherData({
      comprobante: random11Digits,
      fechaHora: fechaHoraStr,
      metodoTexto,
      referencia: referenciaBancaria,
      bancoOrigen: bancoRemitente,
      monto: selectedCuota.montoPagar,
      solicitud: selectedCuota.solicitud
    });

    // Agregar al historial de movimientos
    const newHistorialEntry = {
      id: Date.now(),
      comprobante: random11Digits,
      fecha: now.toLocaleDateString('es-VE'),
      hora: now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      estado: 'Registro de Pago',
      monto: `${selectedCuota.montoPagar.replace(/BS|Bs/gi, '').trim()} BS.`,
      flujo: 'ingreso',
      canal: metodoTexto,
      bancoDestino: bancoRemitente,
      beneficiario: 'Astro Bank',
      concepto: `Pago cuota solicitud ${selectedCuota.solicitud}`
    };
    setHistorialList((prev) => [newHistorialEntry, ...prev]);

    setPaymentSuccess(true);
  };

  const handleSolicitarSubmit = (e) => {
    e.preventDefault();
    const newSolicitudId = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const today = new Date().toLocaleDateString('es-VE');
    const formattedMonto = Number(newCreditData.monto).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const newRequest = {
      id: Date.now(),
      solicitudId: newSolicitudId,
      fechaCorte: '05/12/2026',
      fechaSolicitado: today,
      tipo: newCreditData.tipo,
      montoPagar: `Bs ${formattedMonto}`,
      cuotas: `0/${newCreditData.plazo}`,
      estado: 'ENVIADO',
      tasa: newCreditData.tipo === 'Línea General' ? '16.5% anual' : '14.0% fija',
      limiteTotal: `Bs ${formattedMonto}`,
      descripcion: newCreditData.destino || 'Solicitud de crédito ingresada a través de la banca web.'
    };

    setCreditList([newRequest, ...creditList]);
    setSolicitarSuccess(true);
    setTimeout(() => {
      setSolicitarSuccess(false);
      setSolicitarModalOpen(false);
    }, 1800);
  };

  const handleLimpiarCampos = () => {
    setTxOperacion('p2p');
    setTxDocTipo('V');
    setTxDocNum('');
    setTxBanco('0102 - Banco de Venezuela');
    setTxTelefono('');
    setTxMonto('');
    setTxConcepto('');
  };

  const handleHacerPago = (e) => {
    e.preventDefault();
    if (!txDocNum.trim()) {
      alert('Por favor ingresa el número de documento.');
      return;
    }
    if (!txTelefono.trim()) {
      alert('Por favor ingresa el número de teléfono beneficiario.');
      return;
    }
    if (!txMonto || Number(txMonto) <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    const random11Digits = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const now = new Date();
    const fechaHoraStr = `${now.toLocaleDateString('es-VE')} - ${now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`;
    const formattedMonto = Number(txMonto).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const operacionText =
      txOperacion === 'p2p'
        ? 'P2P (Persona a Persona)'
        : txOperacion === 'p2c'
        ? 'P2C (Persona a Comercio)'
        : 'C2P (Comercio a Persona)';

    const metodoText =
      txMetodo === 'pagomovil' ? 'Pagomóvil' : 'Transferencia Bancaria Inmediata';

    const cuentaText =
      txCuenta === 'financiamiento' ? 'Cuenta - Financiamiento' : 'Cuenta - Línea General';

    const voucherObj = {
      referencia: random11Digits,
      fechaHora: fechaHoraStr,
      cuentaOrigen: cuentaText,
      metodo: metodoText,
      operacion: operacionText,
      documento: `${txDocTipo}-${txDocNum}`,
      telefono: txTelefono,
      banco: txBanco,
      montoFormateado: `Bs ${formattedMonto}`,
      concepto: txConcepto || 'Transferencia inmediata interbancaria'
    };

    setTxVoucher(voucherObj);
    setTxSuccess(true);

    // Agregar a la lista de últimos movimientos
    const newMovement = {
      id: random11Digits,
      fecha: now.toLocaleDateString('es-VE'),
      hora: now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      tipo: txMetodo === 'pagomovil' ? 'Pago Móvil hacia otro banco' : 'Transferencia Inmediata',
      monto: `- Bs ${formattedMonto}`,
      flujo: 'egreso'
    };
    setMovementsList((prev) => [newMovement, ...prev]);

    // Agregar al historial de movimientos
    const newHistorialEntry = {
      id: Date.now(),
      comprobante: random11Digits,
      fecha: now.toLocaleDateString('es-VE'),
      hora: now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      estado: 'Transacción',
      monto: `${formattedMonto} BS.`,
      flujo: 'egreso',
      canal: metodoText,
      bancoDestino: txBanco,
      beneficiario: `${txDocTipo}-${txDocNum}`,
      concepto: txConcepto || 'Transferencia inmediata interbancaria'
    };
    setHistorialList((prev) => [newHistorialEntry, ...prev]);
  };

  return (
    <div className="dashboard-layout">
      {/* ===================================================
          1. SIDEBAR LATERAL IZQUIERDO
         =================================================== */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Cabecera del Sidebar con Logotipo Centrado y Toggle Bar */}
        <div className="dashboard-sidebar-header">
          {!sidebarCollapsed ? (
            <>
              <div
                className="dashboard-logo-display"
                aria-label="Astro Bank"
              >
                <img src={logotipoImg} alt="Astro Bank" className="dashboard-logo-img" />
              </div>

              <button
                type="button"
                className="dashboard-sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(true)}
                title="Contraer barra lateral"
                aria-label="Contraer barra lateral"
              >
                <PanelLeft size={19} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="dashboard-sidebar-star-btn"
              onClick={() => setSidebarCollapsed(false)}
              title="Astro Bank - Expandir barra lateral"
              aria-label="Astro Bank - Expandir barra lateral"
            >
              <img src={logoPhotoroomImg} alt="Astro Bank" className="dashboard-sidebar-star-img" />
            </button>
          )}
        </div>

        {/* Contenedor de Navegación Estructurada */}
        <div className="dashboard-sidebar-nav-container">
          <div className="dashboard-sidebar-group">
            <nav aria-label="Navegación principal">
              <ul className="dashboard-nav-list">
                <li>
                  <button
                    type="button"
                    className={`dashboard-nav-item ${activeNav === 'inicio' ? 'active' : ''}`}
                    title="Inicio"
                    onClick={() => {
                      setActiveNav('inicio');
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <Home size={19} className="dashboard-nav-icon" />
                    <span>Inicio</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`dashboard-nav-item ${activeNav === 'credito' ? 'active' : ''}`}
                    title="Crédito"
                    onClick={() => {
                      setActiveNav('credito');
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <CreditCard size={19} className="dashboard-nav-icon" />
                    <span>Crédito</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`dashboard-nav-item ${activeNav === 'registrar-pago' ? 'active' : ''}`}
                    title="Registrar Pago"
                    onClick={() => {
                      setActiveNav('registrar-pago');
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <Receipt size={19} className="dashboard-nav-icon" />
                    <span>Registrar Pago</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`dashboard-nav-item ${activeNav === 'transaccion' ? 'active' : ''}`}
                    title="Transacción"
                    onClick={() => {
                      setActiveNav('transaccion');
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <ArrowLeftRight size={19} className="dashboard-nav-icon" />
                    <span>Transacción</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`dashboard-nav-item ${activeNav === 'historial' ? 'active' : ''}`}
                    title="Historial de Movimientos"
                    onClick={() => {
                      setActiveNav('historial');
                      setMobileSidebarOpen(false);
                    }}
                  >
                    <History size={19} className="dashboard-nav-icon" />
                    <span>Historial de Movimientos</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Perfil del Usuario en Sidebar (Estilo Gemini) y Cerrar Sesión */}
          <div className="dashboard-sidebar-bottom">
            <div className={`dashboard-sidebar-user-card ${sidebarCollapsed ? 'collapsed' : ''}`}>
              <button
                type="button"
                className={`dashboard-user-profile-trigger ${activeNav === 'perfil' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('perfil');
                  setMobileSidebarOpen(false);
                }}
                title={`Mi Perfil (${getUserDisplayName()})`}
              >
                <div className="dashboard-user-avatar-bubble">
                  {getUserInitial()}
                </div>
                {!sidebarCollapsed && (
                  <div className="dashboard-user-details">
                    <span className="dashboard-user-name-text">
                      {getUserDisplayName()}
                    </span>
                    <span className="dashboard-user-type-tag">
                      {currentUser?.perfil?.includes('Invers') ? 'Inversionista' : 'Personas'}
                    </span>
                  </div>
                )}
              </button>

              {!sidebarCollapsed && (
                <button
                  type="button"
                  className="dashboard-sidebar-logout-btn"
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  aria-label="Cerrar Sesión"
                >
                  <LogOut size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop para cerrar el sidebar en dispositivos móviles */}
      {mobileSidebarOpen && (
        <div
          className="dashboard-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===================================================
          2. ÁREA PRINCIPAL
         =================================================== */}
      <div className="dashboard-main">
        {/* Header Superior */}
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Botón hamburguesa en móvil */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              aria-label="Abrir menú"
            >
              {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <h1 className="dashboard-greeting-title">
              {activeNav === 'credito'
                ? 'Crédito'
                : activeNav === 'registrar-pago'
                ? 'Registrar Pago'
                : activeNav === 'transaccion'
                ? 'Transacción'
                : activeNav === 'historial'
                ? 'Historial de Movimientos'
                : activeNav === 'perfil'
                ? 'Mi Perfil'
                : `${getTimeGreeting()}, ${getUserDisplayName()}`}
            </h1>
          </div>

          <div className="dashboard-header-right">
            {/* Campana de Notificaciones (Único elemento en la barra superior según solicitud) */}
            <button
              type="button"
              className="dashboard-notif-btn"
              title="Notificaciones"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              <span className="dashboard-notif-badge" />
            </button>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <main className="dashboard-body">
          {activeNav === 'registrar-pago' ? (
            /* ===================================================
               VISTA DEDICADA: REGISTRAR PAGO (SEGÚN BOCETO)
               =================================================== */
            <div className="registrar-pago-wrapper">
              {paymentSuccess ? (
                /* Voucher / Comprobante de Pago Exitoso */
                <div className="payment-voucher-card">
                  <div className="payment-voucher-badge">
                    <Check size={36} strokeWidth={2.5} />
                  </div>
                  <h3 className="payment-voucher-title">¡Pago Comprobado y Registrado!</h3>
                  <p className="payment-voucher-desc">
                    Tu pago ha sido validado exitosamente en el sistema de Astro Bank.
                  </p>

                  <div className="payment-voucher-details">
                    <div className="voucher-detail-row highlight">
                      <span>Monto Pagado:</span>
                      <strong>{voucherData.monto}</strong>
                    </div>
                    <div className="voucher-detail-row code">
                      <span>N° de Comprobante:</span>
                      <strong>{voucherData.comprobante}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Solicitud Asociada:</span>
                      <strong>{voucherData.solicitud}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Fecha y Hora:</span>
                      <strong>{voucherData.fechaHora}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Método de Pago:</span>
                      <strong>{voucherData.metodoTexto}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Referencia Bancaria:</span>
                      <strong>{voucherData.referencia}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Banco Remitente:</span>
                      <strong>{voucherData.bancoOrigen}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Estado:</span>
                      <strong style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={15} /> Conciliado / Acreditado
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="bank-btn bank-btn-primary"
                      onClick={() => {
                        setActiveNav('inicio');
                        setPaymentSuccess(false);
                      }}
                    >
                      Volver al Inicio
                    </button>
                    <button
                      type="button"
                      className="bank-btn bank-btn-secondary"
                      onClick={() => {
                        setPaymentSuccess(false);
                        setReferenciaBancaria('');
                        setComprobanteFile(null);
                        setComprobantePreview(null);
                      }}
                    >
                      Registrar Otro Pago
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulario de Registrar Pago según el boceto */
                <div className="registrar-pago-card">
                  <p className="registrar-pago-lead">Tu próxima cuota, sin complicaciones.</p>

                  {/* 1. Elige la cuota */}
                  <div className="pago-section-group" ref={cuotaDropdownRef}>
                    <label className="pago-section-label">Elige la cuota:</label>

                    <div className="cuota-headers-grid">
                      <span>SOLICITUD</span>
                      <span>FECHA DE CORTE</span>
                      <span>TIPO</span>
                      <span>CUOTAS</span>
                      <span>MONTO A PAGAR</span>
                      <span></span>
                    </div>

                    <button
                      type="button"
                      className={`cuota-selector-box ${cuotaDropdownOpen ? 'active' : ''}`}
                      onClick={() => setCuotaDropdownOpen((prev) => !prev)}
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedCuota.solicitud}</span>
                      <span>{selectedCuota.fechaCorte}</span>
                      <span>{selectedCuota.tipo}</span>
                      <span>{selectedCuota.cuotas}</span>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>{selectedCuota.montoPagar}</span>
                      <ChevronDown
                        size={18}
                        style={{
                          transform: cuotaDropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                          margin: '0 auto'
                        }}
                      />
                    </button>

                    {cuotaDropdownOpen && (
                      <div className="cuota-dropdown-list">
                        {PENDING_CUOTAS.map((item) => (
                          <button
                            key={item.solicitud}
                            type="button"
                            className={`cuota-dropdown-row ${selectedCuota.solicitud === item.solicitud ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedCuota(item);
                              setCuotaDropdownOpen(false);
                            }}
                          >
                            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.solicitud}</span>
                            <span>{item.fechaCorte}</span>
                            <span>{item.tipo}</span>
                            <span>{item.cuotas}</span>
                            <span style={{ fontWeight: 800 }}>{item.montoPagar}</span>
                            <span style={{ display: 'flex', justifyContent: 'center' }}>
                              {selectedCuota.solicitud === item.solicitud ? <Check size={16} color="#0000FF" /> : null}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Método de pago */}
                  <div className="pago-section-group">
                    <label htmlFor="metodo-pago-select" className="pago-section-label">Método de pago:</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        id="metodo-pago-select"
                        className="metodo-selector-box"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        style={{ appearance: 'none', paddingRight: 40 }}
                      >
                        <option value="pagomovil">Pagomóvil</option>
                        <option value="transferencia">Transferencia Bancaria</option>
                        <option value="debito">Débito en Cuenta Corriente</option>
                      </select>
                      <ChevronDown
                        size={20}
                        style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#0F172A' }}
                      />
                    </div>
                  </div>

                  {/* 3. Dos Columnas: Datos Bancarios + Cargar Comprobante */}
                  <form onSubmit={handleComprobarPago} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <div className="pago-columns-grid">
                      {/* Columna Izquierda: Datos Bancarios + Verificación */}
                      <div className="pago-left-fields">
                        <div className="pago-subgroup">
                          <h4 className="pago-subtitulo">Datos bancarios:</h4>
                          <div className="datos-bancarios-content">
                            <p className="datos-bancarios-line">Rif: V-12345678-9</p>
                            <p className="datos-bancarios-line">Banco: 0108 (Provincial)</p>
                            <p className="datos-bancarios-line">Teléfono: 04123807072</p>
                          </div>
                        </div>

                        <div className="pago-subgroup">
                          <h4 className="pago-subtitulo">Datos de Verificacion:</h4>
                          <div className="verificacion-inputs-group">
                            <div className="verificacion-field-row">
                              <label htmlFor="banco-remitente-input" className="verificacion-label-text">Banco remitente:</label>
                              <select
                                id="banco-remitente-input"
                                className="verificacion-input-control"
                                value={bancoRemitente}
                                onChange={(e) => setBancoRemitente(e.target.value)}
                              >
                                <option value="Banco de Venezuela">Banco de Venezuela</option>
                                <option value="Banesco">Banesco</option>
                                <option value="Banco Mercantil">Banco Mercantil</option>
                                <option value="BBVA Provincial">BBVA Provincial</option>
                                <option value="Bancaribe">Bancaribe</option>
                                <option value="BNC">BNC</option>
                                <option value="Otro banco nacional">Otro banco nacional</option>
                              </select>
                            </div>

                            <div className="verificacion-field-row">
                              <label htmlFor="referencia-bancaria-input" className="verificacion-label-text">Referencia bancaria:</label>
                              <input
                                type="text"
                                id="referencia-bancaria-input"
                                className="verificacion-input-control"
                                placeholder="Ej: 84920194821"
                                maxLength={11}
                                required
                                value={referenciaBancaria}
                                onChange={(e) => {
                                  const nums = e.target.value.replace(/\D/g, '');
                                  setReferenciaBancaria(nums);
                                }}
                                style={{ fontFamily: 'monospace', letterSpacing: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Columna Derecha: Dropzone Cargar comprobante */}
                      <div
                        className="comprobante-card-dropzone"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept="image/png, image/jpeg, image/jpg, application/pdf"
                          onChange={handleFileChange}
                        />

                        {comprobantePreview ? (
                          <div className="comprobante-preview-box">
                            <img src={comprobantePreview} alt="Comprobante" className="comprobante-preview-img" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', wordBreak: 'break-all' }}>
                              {comprobanteFile?.name}
                            </span>
                            <button
                              type="button"
                              onClick={removeComprobante}
                              className="action-link-btn"
                              style={{ color: '#DC2626', fontSize: 12 }}
                            >
                              Eliminar archivo
                            </button>
                          </div>
                        ) : comprobanteFile ? (
                          <div className="comprobante-preview-box">
                            <FileText size={42} color="#0000FF" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', wordBreak: 'break-all' }}>
                              {comprobanteFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={removeComprobante}
                              className="action-link-btn"
                              style={{ color: '#DC2626', fontSize: 12 }}
                            >
                              Eliminar archivo
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="comprobante-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                              <line x1="16" x2="16" y1="5" y2="9"/>
                              <line x1="14" x2="18" y1="7" y2="7"/>
                            </svg>
                            <p className="comprobante-main-text">Cargar comprobante</p>
                            <p className="comprobante-sub-text">En formato png, jpg, ...</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 4. Botón Comprobar Pago */}
                    <button
                      type="submit"
                      className="btn-comprobar-pago-main"
                    >
                      Comprobar Pago
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : activeNav === 'credito' ? (
            /* ===================================================
               VISTA DEDICADA: PANTALLA DE CRÉDITO (SEGÚN BOCETO)
               =================================================== */
            <div className="credito-view-container">
              <div className="credito-main-card">
                {/* Hero Superior: Cada solicitud, en un solo lugar */}
                <div className="credito-hero-section">
                  <div className="credito-hero-left">
                    <h2 className="credito-hero-title">Cada solicitud, en un solo lugar.</h2>
                    <p className="credito-hero-subtitle">
                      Consulta el avance y las condiciones de tus solicitudes de crédito.
                    </p>

                    <div className="credito-lines-group">
                      <div className="credito-line-item">
                        <span className="credito-line-label">Línea general disponible:</span>
                        <div className="credito-line-amount">Bs 243.234,32</div>
                      </div>

                      <div className="credito-line-item">
                        <span className="credito-line-label">Línea financiamiento disponible:</span>
                        <div className="credito-line-amount">Bs 1.006.698,32</div>
                      </div>
                    </div>
                  </div>

                  <div className="credito-hero-right">
                    <button
                      type="button"
                      className="credito-btn-solicitar"
                      onClick={() => setSolicitarModalOpen(true)}
                    >
                      Solicitar Crédito
                    </button>
                  </div>
                </div>

                {/* Sección de tabla: Solicitudes de crédito */}
                <div className="credito-table-section">
                  <h3 className="credito-section-title">Solicitudes de crédito:</h3>

                  <div className="table-responsive-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Solicitud</th>
                          <th>Fecha Solicitado</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Cuotas</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditList.map((req) => (
                          <tr key={req.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', letterSpacing: '0.5px' }}>
                              {req.solicitudId}
                            </td>
                            <td>{req.fechaSolicitado}</td>
                            <td>
                              <span className="type-badge">{req.tipo}</span>
                            </td>
                            <td>
                              <span className={`status-badge-pill ${req.estado.toLowerCase().replace(/\s+/g, '-')}`}>
                                {req.estado}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600, color: '#64748B' }}>{req.cuotas}</td>
                            <td>
                              <button
                                type="button"
                                className="action-link-btn"
                                onClick={() => setSelectedCredit(req)}
                              >
                                Ver detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : activeNav === 'transaccion' ? (
            /* ===================================================
               VISTA DEDICADA: TRANSACCIÓN (SEGÚN BOCETO)
               =================================================== */
            <div className="transaccion-wrapper">
              {txSuccess && txVoucher ? (
                /* Comprobante de Transacción Exitosa */
                <div className="payment-voucher-card">
                  <div className="payment-voucher-badge">
                    <Check size={36} strokeWidth={2.5} />
                  </div>
                  <h3 className="payment-voucher-title">¡Transacción Realizada con Éxito!</h3>
                  <p className="payment-voucher-desc">
                    La operación ha sido procesada de manera inmediata a través de la red interbancaria.
                  </p>

                  <div className="payment-voucher-details">
                    <div className="voucher-detail-row highlight">
                      <span>Monto Transferido:</span>
                      <strong>{txVoucher.montoFormateado}</strong>
                    </div>
                    <div className="voucher-detail-row code">
                      <span>N° de Referencia:</span>
                      <strong>{txVoucher.referencia}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Cuenta Debitada:</span>
                      <strong>{txVoucher.cuentaOrigen}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Método de Pago:</span>
                      <strong>{txVoucher.metodo}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Tipo de Operación:</span>
                      <strong>{txVoucher.operacion}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Beneficiario:</span>
                      <strong>{txVoucher.documento} • {txVoucher.telefono}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Banco Destino:</span>
                      <strong>{txVoucher.banco}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Concepto:</span>
                      <strong>{txVoucher.concepto}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Fecha y Hora:</span>
                      <strong>{txVoucher.fechaHora}</strong>
                    </div>
                    <div className="voucher-detail-row">
                      <span>Estado:</span>
                      <strong style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={15} /> Aprobado / Liquidado
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
                    <button
                      type="button"
                      className="bank-btn bank-btn-primary"
                      onClick={() => {
                        setActiveNav('inicio');
                        setTxSuccess(false);
                      }}
                    >
                      Ir al Inicio
                    </button>
                    <button
                      type="button"
                      className="bank-btn bank-btn-secondary"
                      onClick={() => {
                        setTxSuccess(false);
                        handleLimpiarCampos();
                      }}
                    >
                      Hacer Otra Transacción
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulario de Transacción según boceto */
                <div className="transaccion-card">
                  <p className="transaccion-lead">Cada pago cuenta.</p>

                  <form onSubmit={handleHacerPago} className="transaccion-form">
                    {/* 1. Elige la cuenta */}
                    <div className="pago-section-group">
                      <label htmlFor="tx-cuenta-select" className="pago-section-label">Elige la cuenta:</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="tx-cuenta-select"
                          className="metodo-selector-box"
                          value={txCuenta}
                          onChange={(e) => setTxCuenta(e.target.value)}
                          style={{ appearance: 'none', paddingRight: 40 }}
                        >
                          <option value="linea-general">Cuenta - Linea general</option>
                          <option value="financiamiento">Cuenta - Financiamiento</option>
                        </select>
                        <ChevronDown
                          size={20}
                          style={{
                            position: 'absolute',
                            right: 18,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: '#0F172A'
                          }}
                        />
                      </div>
                      <div className="transaccion-saldo-row">
                        <span className="transaccion-saldo-text">
                          Saldo disponible: {txCuenta === 'financiamiento' ? 'Bs 1.006.698,32' : 'Bs 243.234,32'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Método de pago */}
                    <div className="pago-section-group">
                      <label htmlFor="tx-metodo-select" className="pago-section-label">Método de pago:</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="tx-metodo-select"
                          className="metodo-selector-box"
                          value={txMetodo}
                          onChange={(e) => setTxMetodo(e.target.value)}
                          style={{ appearance: 'none', paddingRight: 40 }}
                        >
                          <option value="pagomovil">Pagomóvil</option>
                          <option value="transferencia">Transferencia Bancaria Inmediata</option>
                        </select>
                        <ChevronDown
                          size={20}
                          style={{
                            position: 'absolute',
                            right: 18,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: '#0F172A'
                          }}
                        />
                      </div>
                    </div>

                    {/* 3. Datos bancarios (2 Columnas: Formulario a la izquierda, Marca Astro Bank a la derecha) */}
                    <div className="transaccion-datos-section">
                      <h4 className="pago-subtitulo" style={{ marginBottom: 16 }}>Datos bancarios:</h4>

                      <div className="transaccion-grid-2col">
                        {/* Columna Izquierda: Inputs */}
                        <div className="transaccion-inputs-col">
                          {/* Operacion */}
                          <div className="transaccion-field-group">
                            <div style={{ position: 'relative' }}>
                              <select
                                className="transaccion-input-box select"
                                value={txOperacion}
                                onChange={(e) => setTxOperacion(e.target.value)}
                                style={{ appearance: 'none', paddingRight: 36 }}
                              >
                                <option value="p2p">Operacion: P2P (Persona a Persona)</option>
                                <option value="p2c">Operacion: P2C (Persona a Comercio)</option>
                                <option value="c2p">Operacion: C2P (Comercio a Persona)</option>
                              </select>
                              <ChevronDown
                                size={18}
                                style={{
                                  position: 'absolute',
                                  right: 14,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  pointerEvents: 'none',
                                  color: '#0F172A'
                                }}
                              />
                            </div>
                          </div>

                          {/* Documento */}
                          <div className="transaccion-field-group">
                            <div className="transaccion-doc-compound">
                              <select
                                value={txDocTipo}
                                onChange={(e) => setTxDocTipo(e.target.value)}
                                className="transaccion-doc-prefix"
                              >
                                <option value="V">V</option>
                                <option value="E">E</option>
                                <option value="J">J</option>
                                <option value="G">G</option>
                              </select>
                              <input
                                type="text"
                                className="transaccion-input-box"
                                placeholder="Documento (ej. 12345678)"
                                value={txDocNum}
                                onChange={(e) => setTxDocNum(e.target.value.replace(/\D/g, ''))}
                                required
                              />
                            </div>
                          </div>

                          {/* Banco */}
                          <div className="transaccion-field-group">
                            <div style={{ position: 'relative' }}>
                              <select
                                className="transaccion-input-box select"
                                value={txBanco}
                                onChange={(e) => setTxBanco(e.target.value)}
                                style={{ appearance: 'none', paddingRight: 36 }}
                              >
                                <option value="0102 - Banco de Venezuela">0102 - Banco de Venezuela</option>
                                <option value="0108 - Banco Provincial">0108 - Banco Provincial</option>
                                <option value="0134 - Banesco">0134 - Banesco</option>
                                <option value="0105 - Banco Mercantil">0105 - Banco Mercantil</option>
                                <option value="0114 - Bancaribe">0114 - Bancaribe</option>
                                <option value="0191 - BNC">0191 - BNC</option>
                                <option value="0163 - Banco del Tesoro">0163 - Banco del Tesoro</option>
                                <option value="0172 - Bancamiga">0172 - Bancamiga</option>
                              </select>
                              <ChevronDown
                                size={18}
                                style={{
                                  position: 'absolute',
                                  right: 14,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  pointerEvents: 'none',
                                  color: '#0F172A'
                                }}
                              />
                            </div>
                          </div>

                          {/* Telefono */}
                          <div className="transaccion-field-group">
                            <input
                              type="tel"
                              className="transaccion-input-box"
                              placeholder="Telefono (ej. 0414-1234567)"
                              value={txTelefono}
                              onChange={(e) => setTxTelefono(e.target.value)}
                              required
                            />
                          </div>

                          {/* Monto */}
                          <div className="transaccion-field-group">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              className="transaccion-input-box"
                              placeholder="Monto (Bs)"
                              value={txMonto}
                              onChange={(e) => setTxMonto(e.target.value)}
                              required
                            />
                          </div>

                          {/* Concepto */}
                          <div className="transaccion-field-group">
                            <input
                              type="text"
                              className="transaccion-input-box"
                              placeholder="Concepto (ej. Pago de servicio)"
                              value={txConcepto}
                              onChange={(e) => setTxConcepto(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Columna Derecha: Astro Bank Star & Branding */}
                        <div className="transaccion-brand-col">
                          <div className="transaccion-brand-watermark">
                            <span className="transaccion-brand-title">Astro Bank</span>
                            <svg
                              className="transaccion-brand-star-svg"
                              viewBox="0 0 100 100"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M50 4 L57 39 L92 50 L57 61 L50 96 L43 61 L8 50 L43 39 Z"
                                stroke="#0000FF"
                                strokeWidth="3.5"
                                strokeLinejoin="round"
                                fill="none"
                              />
                              <path
                                d="M50 20 L54 44 L78 50 L54 56 L50 80 L46 56 L22 50 L46 44 Z"
                                stroke="#0000FF"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                fill="rgba(0, 0, 255, 0.08)"
                              />
                              <circle cx="50" cy="50" r="3.5" fill="#0000FF" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Botones de acción: Hacer pago / Limpiar campos */}
                    <div className="transaccion-actions-row">
                      <button type="submit" className="btn-hacer-pago">
                        Hacer pago
                      </button>
                      <button
                        type="button"
                        className="btn-limpiar-campos"
                        onClick={handleLimpiarCampos}
                      >
                        Limpiar campos
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : activeNav === 'historial' ? (
            /* ===================================================
               VISTA DEDICADA: HISTORIAL DE MOVIMIENTOS (SEGÚN BOCETO)
               =================================================== */
            <div className="historial-wrapper">
              <div className="historial-card">
                <p className="historial-lead">Consulta tus movimientos y conserva tus comprobantes.</p>

                <div className="historial-table-box">
                  <div className="table-responsive-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>NUMERO DE COMPROBANTE</th>
                          <th>FECHA</th>
                          <th>Hora</th>
                          <th>ESTADO</th>
                          <th>Monto</th>
                          <th>ACCIÓN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialList.map((mov) => (
                          <tr key={mov.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', letterSpacing: '0.5px' }}>
                              {mov.comprobante}
                            </td>
                            <td>{mov.fecha}</td>
                            <td style={{ color: '#64748B' }}>{mov.hora}</td>
                            <td>
                              <span className={`estado-badge-historial ${mov.estado.toLowerCase().replace(/\s+/g, '-')}`}>
                                {mov.estado}
                              </span>
                            </td>
                            <td className={mov.flujo === 'ingreso' ? 'monto-historial-green' : 'monto-historial-dark'}>
                              {mov.monto}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="action-link-btn"
                                onClick={() => setSelectedMovement(mov)}
                              >
                                Ver detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ===================================================
               VISTA PRINCIPAL / GENERAL DEL DASHBOARD (INICIO)
               =================================================== */
            <>
              {/* -------------------------------------------------
                  FILA SUPERIOR: MI CRÉDITO ACTIVO + PRÓXIMA CUOTA
                 ------------------------------------------------- */}
              <div className="dashboard-top-grid">
                {/* Tarjeta 1: Mi Crédito Activo */}
                <div className="dashboard-card">
                  <div>
                    <div className="credit-active-header">
                      <h2 className="credit-active-title">Mi Crédito Activo</h2>
                      <span className="credit-badge-status">
                        <CheckCircle size={13} />
                        Al día
                      </span>
                    </div>

                    {/* Billeteras: General y Financiamiento */}
                    <div className="billeteras-container">
                      <span className="billeteras-label">Billetera:</span>
                      <div className="credit-tabs-row" role="tablist" aria-label="Billeteras">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={creditTab === 'general'}
                          className={`credit-tab-btn ${creditTab === 'general' ? 'active' : ''}`}
                          onClick={() => setCreditTab('general')}
                        >
                          General
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={creditTab === 'financiamiento'}
                          className={`credit-tab-btn ${creditTab === 'financiamiento' ? 'active' : ''}`}
                          onClick={() => setCreditTab('financiamiento')}
                        >
                          Financiamiento
                        </button>
                      </div>
                    </div>

                    {/* Contenedor deslizante de Billeteras con animación suave sin saltos */}
                    <div className="billetera-slider-viewport">
                      <div
                        className="billetera-slider-track"
                        style={{
                          transform: creditTab === 'general' ? 'translateX(0%)' : 'translateX(-50%)'
                        }}
                      >
                        {/* Slide 1: Billetera General */}
                        <div className="billetera-slide">
                          <span className="credit-line-label">Línea general disponible:</span>
                          <div className="credit-main-amount">Bs 243.234,32</div>

                          <CreditSparkline tab="general" />

                          <div className="credit-progress-bar-bg">
                            <div className="credit-progress-bar-fill" style={{ width: '23.4%' }} />
                          </div>

                          <div className="credit-progress-row">
                            <span className="credit-progress-caption">
                              3 de 12 Cuotas Pagadas - 23,4% del capital
                            </span>
                            <button
                              type="button"
                              className="credit-link-details"
                              onClick={() => setActiveNav('credito')}
                            >
                              <span>Ver mi crédito</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Slide 2: Billetera Financiamiento */}
                        <div className="billetera-slide">
                          <span className="credit-line-label">Línea financiamiento disponible:</span>
                          <div className="credit-main-amount">Bs 1.006.698,32</div>

                          <CreditSparkline tab="financiamiento" />

                          <div className="credit-progress-bar-bg">
                            <div className="credit-progress-bar-fill" style={{ width: '0%' }} />
                          </div>

                          <div className="credit-progress-row">
                            <span className="credit-progress-caption">
                              0 de 12 Cuotas Pagadas - 0% del capital
                            </span>
                            <button
                              type="button"
                              className="credit-link-details"
                              onClick={() => setActiveNav('credito')}
                            >
                              <span>Ver mi crédito</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta 2: Tu Próxima Cuota */}
                <div className="dashboard-card cuota-card">
                  <div>
                    <div className="cuota-header">
                      <h2 className="cuota-title">Tu próxima cuota:</h2>
                      <span className="cuota-badge-days">
                        <Clock size={13} />
                        Vence en 7 días
                      </span>
                    </div>

                    <div className="cuota-label">Monto a pagar:</div>
                    <div className="cuota-amount">Bs 70.321,55</div>
                    <div className="cuota-deadline">Cuota 04 - 05 de Diciembre de 2026</div>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="cuota-btn-pay"
                      onClick={() => setActiveNav('registrar-pago')}
                    >
                      <Receipt size={17} />
                      <span>Registrar Pago</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------
                  SECCIÓN: SOLICITUDES DE CRÉDITO
                 ------------------------------------------------- */}
              <div className="inicio-section-block">
                <h3 className="inicio-section-title">Solicitudes de crédito:</h3>

                <div className="dashboard-table-card">
                  <div className="table-responsive-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Fecha de Corte</th>
                          <th>Tipo</th>
                          <th>Monto a Pagar</th>
                          <th>Cuotas</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditList.map((req) => (
                          <tr key={req.id}>
                            <td>{req.fechaCorte}</td>
                            <td>
                              <span className="type-badge">{req.tipo}</span>
                            </td>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{req.montoPagar}</td>
                            <td style={{ fontWeight: 600, color: '#64748B' }}>{req.cuotas}</td>
                            <td>
                              <button
                                type="button"
                                className="action-link-btn"
                                onClick={() => setSelectedCredit(req)}
                              >
                                Ver detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------
                  SECCIÓN: ÚLTIMOS MOVIMIENTOS
                 ------------------------------------------------- */}
              <div className="inicio-section-block">
                <h3 className="inicio-section-title">Últimos movimientos</h3>

                <div className="dashboard-table-card">
                  <div className="table-responsive-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Número de Comprobante</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Tipo</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movementsList.map((tx) => (
                          <tr key={tx.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', letterSpacing: '0.5px' }}>
                              {tx.id}
                            </td>
                            <td>{tx.fecha}</td>
                            <td style={{ color: '#64748B' }}>{tx.hora}</td>
                            <td style={{ fontWeight: 600, color: '#1E293B' }}>{tx.tipo}</td>
                            <td className={tx.flujo === 'ingreso' ? 'amount-income' : 'amount-expense'}>
                              {tx.monto}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* -------------------------------------------------
              FOOTER DEL DASHBOARD
             ------------------------------------------------- */}
          <footer className="dashboard-footer">
            <span>Astro Bank • Proyecto de banca académica</span>
            <span>Datos de ejemplo</span>
          </footer>
        </main>
      </div>

      {/* ===================================================
          MODAL: DETALLES DE SOLICITUD DE CRÉDITO
         =================================================== */}
      {selectedCredit && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-card">
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">Detalles del Crédito</h3>
              <button
                type="button"
                className="dashboard-modal-close"
                onClick={() => setSelectedCredit(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
                <span className="type-badge" style={{ marginBottom: 8 }}>
                  {selectedCredit.tipo}
                </span>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#475569' }}>
                  {selectedCredit.descripcion}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>MONTO A PAGAR</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                    {selectedCredit.montoPagar}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>FECHA DE CORTE</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    {selectedCredit.fechaCorte}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>CUOTAS</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    {selectedCredit.cuotas}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>TASA DE INTERÉS</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0000FF' }}>
                    {selectedCredit.tasa}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Límite total asignado:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{selectedCredit.limiteTotal}</span>
              </div>

              <button
                type="button"
                className="bank-btn bank-btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => setSelectedCredit(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: SOLICITAR NUEVO CRÉDITO
         =================================================== */}
      {solicitarModalOpen && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-card">
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">Solicitar Crédito</h3>
              <button
                type="button"
                className="dashboard-modal-close"
                onClick={() => setSolicitarModalOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            {solicitarSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <Check size={30} strokeWidth={2.5} />
                </div>
                <h4 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
                  ¡Solicitud Enviada con Éxito!
                </h4>
                <p style={{ color: '#64748B', fontSize: 14 }}>
                  Tu solicitud ha sido ingresada con estado ENVIADO y se encuentra en evaluación.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSolicitarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label className="bank-label" htmlFor="solTipo" style={{ marginBottom: 6, display: 'block' }}>
                    Tipo de Crédito
                  </label>
                  <select
                    id="solTipo"
                    className="bank-select"
                    value={newCreditData.tipo}
                    onChange={(e) => setNewCreditData({ ...newCreditData, tipo: e.target.value })}
                  >
                    <option value="Financiamiento">Financiamiento Personal</option>
                    <option value="Línea General">Línea General Rotativa</option>
                    <option value="Producto">Crédito de Producto Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="bank-label" htmlFor="solMonto" style={{ marginBottom: 6, display: 'block' }}>
                    Monto a Solicitar (Bs)
                  </label>
                  <input
                    type="number"
                    id="solMonto"
                    placeholder="Ej: 50000"
                    min="1000"
                    step="500"
                    required
                    value={newCreditData.monto}
                    onChange={(e) => setNewCreditData({ ...newCreditData, monto: e.target.value })}
                    className="bank-input"
                  />
                </div>

                <div>
                  <label className="bank-label" htmlFor="solPlazo" style={{ marginBottom: 6, display: 'block' }}>
                    Plazo en Cuotas
                  </label>
                  <select
                    id="solPlazo"
                    className="bank-select"
                    value={newCreditData.plazo}
                    onChange={(e) => setNewCreditData({ ...newCreditData, plazo: e.target.value })}
                  >
                    <option value="6">6 Cuotas (6 meses)</option>
                    <option value="12">12 Cuotas (1 año)</option>
                    <option value="18">18 Cuotas (1 año y medio)</option>
                    <option value="24">24 Cuotas (2 años)</option>
                  </select>
                </div>

                <div>
                  <label className="bank-label" htmlFor="solDestino" style={{ marginBottom: 6, display: 'block' }}>
                    Destino o Finalidad del Crédito
                  </label>
                  <input
                    type="text"
                    id="solDestino"
                    placeholder="Ej: Inversión personal, adquisición de bienes..."
                    required
                    value={newCreditData.destino}
                    onChange={(e) => setNewCreditData({ ...newCreditData, destino: e.target.value })}
                    className="bank-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSolicitarModalOpen(false)}
                    className="bank-btn bank-btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bank-btn bank-btn-primary"
                    style={{ flex: 1.5 }}
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* ===================================================
          MODAL: DETALLES DEL MOVIMIENTO / COMPROBANTE
         =================================================== */}
      {selectedMovement && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-card">
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">Detalles del Movimiento</h3>
              <button
                type="button"
                className="dashboard-modal-close"
                onClick={() => setSelectedMovement(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
                <span className={`estado-badge-historial ${selectedMovement.estado.toLowerCase().replace(/\s+/g, '-')}`} style={{ marginBottom: 8 }}>
                  {selectedMovement.estado}
                </span>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#475569' }}>
                  {selectedMovement.concepto}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>N° COMPROBANTE</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                    {selectedMovement.comprobante}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>MONTO</span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: selectedMovement.flujo === 'ingreso' ? '#16A34A' : '#0F172A' }}>
                    {selectedMovement.monto}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>FECHA Y HORA</span>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A' }}>
                    {selectedMovement.fecha} - {selectedMovement.hora}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>CANAL / MÉTODO</span>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0000FF' }}>
                    {selectedMovement.canal}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>DESTINO / BANCO</span>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#0F172A' }}>
                    {selectedMovement.bancoDestino}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>BENEFICIARIO</span>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#0F172A' }}>
                    {selectedMovement.beneficiario}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Estado de Conciliación:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={15} /> Conciliado / Acreditado
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="bank-btn bank-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => window.print()}
                >
                  Imprimir Comprobante
                </button>
                <button
                  type="button"
                  className="bank-btn bank-btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedMovement(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
