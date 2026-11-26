import InfoPageLayout from '../components/InfoPageLayout';

export default function SolucionesCreditoPage() {
  return (
    <InfoPageLayout
      title="Soluciones de crédito"
      subtitle="Opciones de financiamiento diseñadas para adaptarse a consumos cotidianos, proyectos personales y compras en comercios aliados."
      ctaText="Solicita tu línea de crédito desde tu cuenta."
      ctaLabel="Ir a Registro"
      ctaTo="/registro"
    >
      <section className="info-section">
        <h2>Línea General</h2>
        <p>
          Es una línea de crédito rotativa pensada para ofrecer liquidez inmediata. Permite realizar
          consumos, pagos móviles y transferencias según el límite disponible en tu billetera general,
          reponiendo el cupo a medida que se cancelan las cuotas.
        </p>
      </section>

      <section className="info-section">
        <h2>Financiamiento a mediano plazo</h2>
        <p>
          Orientado a metas específicas como inversión personal, equipamiento o remodelación. Cuenta
          con plazos definidos (por ejemplo, 6 o 12 cuotas), tasa fija de referencia y un cronograma
          claro visible en todo momento desde el panel principal.
        </p>
      </section>

      <section className="info-section">
        <h2>Crédito por Producto</h2>
        <p>
          Modalidad destinada a la adquisición de bienes o servicios en comercios aliados, con cuotas
          programadas y seguimiento directo desde la sección de crédito del dashboard.
        </p>
      </section>

      <section className="info-section">
        <h2>Gestión y registro de pagos</h2>
        <p>
          Desde la plataforma puedes consultar tu próxima fecha de corte, revisar el porcentaje de
          capital pagado y registrar abonos mediante Pagomóvil, transferencia bancaria o débito en
          cuenta, generando un comprobante digital inmediato.
        </p>
      </section>
    </InfoPageLayout>
  );
}
