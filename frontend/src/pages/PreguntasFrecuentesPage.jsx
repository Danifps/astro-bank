import InfoPageLayout from '../components/InfoPageLayout';

const FAQS = [
  {
    q: '¿Qué requisitos necesito para abrir una cuenta?',
    a: 'Debes ser mayor de 18 años, contar con tu documento de identidad vigente (entre 5 y 9 dígitos) y completar el formulario de registro progresivo con tus datos personales, dirección y credenciales de acceso.'
  },
  {
    q: '¿Cuál es la diferencia entre Billetera General y Financiamiento?',
    a: 'La Billetera General corresponde a tu línea de crédito rotativa para consumos y transferencias inmediatas. La billetera de Financiamiento agrupa los créditos a plazo fijo destinados a metas o proyectos específicos.'
  },
  {
    q: '¿Cómo registro el pago de una cuota?',
    a: 'Dentro del Dashboard, ingresa a la sección "Registrar Pago", selecciona la cuota pendiente, elige el método (Pagomóvil, Transferencia Bancaria o Débito en Cuenta), ingresa la referencia y adjunta el comprobante si corresponde.'
  },
  {
    q: '¿Qué operaciones puedo hacer en la sección Transacción?',
    a: 'Puedes ejecutar transferencias inmediatas y operaciones Pagomóvil (P2P, P2C y C2P) seleccionando la cuenta de origen, el banco destino y generando el comprobante de la operación al instante.'
  },
  {
    q: '¿Astro Bank maneja dinero real?',
    a: 'No. Astro Bank es una plataforma académica y demostrativa. No capta fondos reales, no procesa dinero ni emite créditos con validez financiera.'
  }
];

export default function PreguntasFrecuentesPage() {
  return (
    <InfoPageLayout
      title="Preguntas frecuentes"
      subtitle="Respuestas directas a las consultas más comunes sobre el uso de la plataforma, cuentas y operaciones."
    >
      {FAQS.map((item) => (
        <div key={item.q} className="info-faq-item">
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </div>
      ))}
    </InfoPageLayout>
  );
}
