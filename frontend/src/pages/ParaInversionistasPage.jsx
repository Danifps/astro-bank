import InfoPageLayout from '../components/InfoPageLayout';

export default function ParaInversionistasPage() {
  return (
    <InfoPageLayout
      title="Para inversionistas"
      subtitle="Participa en el ecosistema de crédito de Astro Bank con visibilidad sobre el rendimiento, el riesgo y el flujo de capital."
      ctaText="¿Ya cuentas con acceso de inversionista?"
      ctaLabel="Ingresar como Inversionista"
      ctaTo="/login-inversionistas"
    >
      <section className="info-section">
        <h2>Cómo funciona la participación</h2>
        <p>
          En el modelo de banca distribuida de Astro Bank, los inversionistas aportan liquidez que
          respalda las distintas líneas de crédito y planes de financiamiento ofrecidos a los
          clientes de Banca Personas.
        </p>
      </section>

      <section className="info-section">
        <h2>Beneficios del portal</h2>
        <ul className="info-list">
          <li>
            <strong>Visibilidad operativa:</strong> monitoreo en tiempo real de billeteras, montos
            colocados y evolución semestral.
          </li>
          <li>
            <strong>Diversificación por modalidad:</strong> exposición equilibrada entre líneas
            rotativas generales y financiamientos a plazo fijo.
          </li>
          <li>
            <strong>Trazabilidad:</strong> historial completo de movimientos y comprobantes
            asociados a cada operación.
          </li>
        </ul>
      </section>

      <section className="info-section">
        <h2>Acceso dedicado</h2>
        <p>
          Los usuarios con perfil de inversionista disponen de un inicio de sesión independiente
          diseñado para consultar sus métricas y gestionar su portafolio dentro del sistema.
        </p>
      </section>
    </InfoPageLayout>
  );
}
