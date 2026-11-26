import InfoPageLayout from '../components/InfoPageLayout';

export default function QuienesSomosPage() {
  return (
    <InfoPageLayout
      title="Quiénes somos"
      subtitle="Conoce la visión, el modelo operativo y el propósito de Astro Bank como plataforma de banca digital distribuida."
    >
      <section className="info-section">
        <h2>Nuestra misión</h2>
        <p>
          Astro Bank nace con el objetivo de ofrecer una experiencia financiera clara, ágil y
          transparente, conectando a personas que buscan financiamiento accesible con inversionistas
          interesados en respaldar líneas de crédito de manera estructurada.
        </p>
      </section>

      <section className="info-section">
        <h2>Modelo de banca distribuida</h2>
        <p>
          Nuestra arquitectura separa la gestión operativa en dos perfiles complementarios dentro de
          un mismo ecosistema digital:
        </p>
        <ul className="info-list">
          <li>
            <strong>Banca Personas:</strong> acceso a líneas de crédito rotativas, financiamiento a
            plazos, pagos móviles, transferencias interbancarias y control detallado de cuotas.
          </li>
          <li>
            <strong>Portal de Inversionistas:</strong> seguimiento de capital asignado, rendimiento
            estimado y diversificación dentro de la cartera crediticia de la plataforma.
          </li>
        </ul>
      </section>

      <section className="info-section">
        <h2>Transparencia y alcance académico</h2>
        <p>
          Astro Bank es un proyecto académico desarrollado con fines demostrativos y de aprendizaje.
          No constituye una entidad financiera regulada, no capta fondos reales del público ni otorga
          créditos con validez comercial.
        </p>
      </section>
    </InfoPageLayout>
  );
}
