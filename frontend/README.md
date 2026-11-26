# AstroBank

**Plataforma de Banca Digital**

Astro Bank es una aplicación web de banca digital desarrollada con React y Vite. Proporciona una interfaz moderna y funcional para la gestión de productos financieros, operaciones bancarias y seguimiento crediticio.

---

## Tabla de contenidos

- [Descripcion general](#descripcion-general)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Stack tecnologico](#stack-tecnologico)
- [Requisitos previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura de directorios](#estructura-de-directorios)
- [Modulos funcionales](#modulos-funcionales)
- [Tipografia y diseno](#tipografia-y-diseno)
- [Licencia](#licencia)

---

## Descripcion general

La plataforma ofrece un entorno completo de banca en linea orientado a dos perfiles de usuario:

- **Personas**: clientes naturales con acceso a productos de credito, transacciones y gestion de pagos.
- **Inversionistas**: clientes con perfil de inversion y acceso a productos financieros especializados.

El sistema cubre el ciclo completo desde la landing page publica, el registro e inicio de sesion, hasta el dashboard operativo con multiples secciones funcionales.

---

## Arquitectura del proyecto

La aplicacion sigue una arquitectura de Single Page Application (SPA) con enrutamiento del lado del cliente. La estructura se organiza en capas claras:

```
Landing Page (publica)
    |
    +-- Login Personas / Login Inversionistas
    |
    +-- Registro de Usuario
    |
    +-- Dashboard (autenticado)
            |
            +-- Inicio (resumen crediticio, proxima cuota, movimientos)
            +-- Credito (solicitudes, detalle, estados)
            +-- Registrar Pago (seleccion de cuota, comprobante)
            +-- Transaccion (pagomovil, transferencias)
            +-- Historial de Movimientos (registro completo)
            +-- Mi Perfil
```

---

## Stack tecnologico

| Tecnologia          | Version    | Proposito                                    |
|---------------------|------------|----------------------------------------------|
| React               | 19.3.1     | Biblioteca principal de interfaz de usuario  |
| React DOM           | 19.3.1     | Renderizado en el navegador                  |
| React Router DOM    | 7.18.5     | Enrutamiento del lado del cliente            |
| Vite                | 8.3.6      | Bundler y servidor de desarrollo             |
| Tailwind CSS        | 4.3.5      | Framework de utilidades CSS                  |
| Framer Motion       | 14.14.0    | Animaciones y transiciones                   |
| Lucide React        | 1.76.0     | Biblioteca de iconos                         |
| ESLint              | 10.14.0    | Analisis estatico de codigo                  |

---

## Requisitos previos

- **Node.js** version 18 o superior.
- **npm** version 9 o superior (incluido con Node.js).

---

## Instalacion

Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/LeoDevINC/AstroBank.git
cd AstroBank
npm install
```

> Nota: El directorio `node_modules` (que contiene Vite y las dependencias del proyecto) esta excluido del repositorio mediante `.gitignore`. Es indispensable ejecutar `npm install` tras clonar el proyecto antes de iniciar el servidor de desarrollo.

---

## Scripts disponibles

| Comando             | Descripcion                                             |
|---------------------|---------------------------------------------------------|
| `npm run dev`       | Inicia el servidor de desarrollo con recarga en caliente |
| `npm run build`     | Genera la build de produccion optimizada                |
| `npm run preview`   | Sirve la build de produccion localmente para revision   |
| `npm run lint`      | Ejecuta ESLint para analisis estatico del codigo        |

---

## Estructura de directorios

```
AstroBank/
  public/
    logo-Photoroom.png          # Isotipo (favicon y sidebar colapsado)
  src/
    assets/
      logotipo.png              # Logotipo completo (Astro Bank + isotipo)
      logo-Photoroom.png        # Isotipo para uso interno
      favicon.svg               # Favicon vectorial
    components/
      AuthLayout.jsx            # Layout compartido para pantallas de autenticacion
      HomeNavbar.jsx            # Barra de navegacion de la landing page
      HomeCarousel.jsx          # Carrusel principal de la landing
      Footer.jsx                # Pie de pagina
      QuickNeeds.jsx            # Seccion de necesidades rapidas
      TypographicBanner.jsx     # Banner tipografico
      CreditHeroSection.jsx     # Seccion hero de credito
      CardsCarousel.jsx         # Carrusel de tarjetas
      QuickMoneyCTA.jsx         # Call-to-action de dinero rapido
      PersonasIllustration.jsx  # Ilustracion para login personas
      InvestorIllustration.jsx  # Ilustracion para login inversionistas
      BackgroundMusicMute.jsx   # Control de musica de fondo
    hooks/
      useBackgroundMusic.js     # Hook para gestion de audio de fondo
    pages/
      LandingPage.jsx           # Pagina de inicio publica
      LoginPage.jsx             # Inicio de sesion para personas
      InvestorLoginPage.jsx     # Inicio de sesion para inversionistas
      RegisterPage.jsx          # Registro de nuevos usuarios
      DashboardPage.jsx         # Dashboard principal (modulo central)
    styles/
      index.css                 # Estilos globales
      App.css                   # Estilos del componente raiz
      Dashboard.css             # Estilos del dashboard
      Login.css                 # Estilos de autenticacion
      HomeNavbar.css            # Estilos de la barra de navegacion
      HomeCarousel.css          # Estilos del carrusel
      Footer.css                # Estilos del pie de pagina
      Register.css              # Estilos del registro
      ...                       # Estilos adicionales por componente
    App.jsx                     # Componente raiz con definicion de rutas
    main.jsx                    # Punto de entrada de la aplicacion
  index.html                    # Documento HTML base
  vite.config.js                # Configuracion de Vite
  package.json                  # Dependencias y scripts del proyecto
```

---

## Modulos funcionales

### Landing Page

Pagina publica que presenta la propuesta de valor de Astro Bank. Incluye navegacion, carrusel de productos, seccion de credito, catalogo de tarjetas y pie de pagina institucional.

### Autenticacion

Dos flujos de inicio de sesion diferenciados segun el perfil del usuario:

- **Personas**: acceso mediante cedula/usuario y clave, con opcion de acceso rapido para demostracion.
- **Inversionistas**: flujo independiente con formulario y contexto visual propio.

Ambos comparten el layout de autenticacion (`AuthLayout`) y redirigen al dashboard tras la validacion.

### Dashboard

Modulo central de la aplicacion. Implementa un layout con sidebar colapsable y area principal de contenido. Las secciones disponibles son:

- **Inicio**: tarjeta de credito activo con billeteras (General y Financiamiento), grafica de evolucion semestral (sparkline), barra de progreso de cuotas, proxima cuota con fecha de vencimiento, solicitudes de credito y ultimos movimientos.
- **Credito**: listado de solicitudes con estados (Enviado, En revision, Aprobado), detalle expandible y formulario para nuevas solicitudes.
- **Registrar Pago**: seleccion de cuota pendiente, metodo de pago (Pagomovil, Transferencia, Debito), carga de comprobante y generacion de voucher.
- **Transaccion**: operaciones P2P, P2C y C2P con seleccion de cuenta origen, banco destino y generacion de comprobante.
- **Historial de Movimientos**: registro cronologico de todas las operaciones con detalle expandible.
- **Mi Perfil**: informacion del usuario autenticado.

El sidebar muestra un saludo dinamico basado en la hora del dia y permite la navegacion entre secciones. En su estado colapsado, el isotipo de Astro Bank funciona como control para expandir la barra lateral.

---

## Tipografia y diseno

La interfaz utiliza dos familias tipograficas cargadas desde Google Fonts:

- **Montserrat** (pesos 300 a 900): titulos, encabezados, botones, montos y elementos de enfasis.
- **Roboto** (pesos 300 a 700): texto de lectura general, formularios y contenido secundario.

La paleta de colores se centra en tonos azules (`#0000FF` como color primario), con grises neutros para fondos y textos secundarios. Los componentes siguen un lenguaje visual consistente con bordes redondeados, sombras sutiles y transiciones suaves.

---

## Licencia

Todos los derechos reservados. Este software es propiedad de Astro Bank.

