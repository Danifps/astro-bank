import InfoPageLayout from '../components/InfoPageLayout';

export default function SegurosPage() {
  return (
    <InfoPageLayout
      eyebrow="Protección y Respaldo"
      title="Seguros Astro Bank"
      subtitle="Coberturas diseñadas para resguardar tus líneas de crédito, operaciones digitales y compromisos financieros."
      ctaText="Protege tu cuenta abriendo tu línea en Astro Bank."
      ctaLabel="Abrir cuenta"
      ctaTo="/registro"
    >
      <section className="info-section">
        <h2>Protección de Crédito</h2>
        <p>
          Respalda el saldo pendiente de tu Línea General o Financiamiento ante imprevistos,
          garantizando continuidad y tranquilidad para ti y tu entorno familiar sin afectar tu
          historial dentro de la plataforma.
        </p>
      </section>

      <section className="info-section">
        <h2>Resguardo de Operaciones Digitales</h2>
        <p>
          Cobertura orientada a transacciones electrónicas, pagos móviles y transferencias
          inmediatas registradas desde la banca web, con validación de comprobantes y trazabilidad
          en el historial de movimientos.
        </p>
      </section>

      <section className="info-section">
        <h2>Alcance de la información</h2>
        <p>
          Al tratarse de un proyecto académico y demostrativo, los planes de seguro descritos
          tienen carácter exclusivamente ilustrativo y no constituyen pólizas comerciales emitidas.
        </p>
      </section>
    </InfoPageLayout>
  );
}
