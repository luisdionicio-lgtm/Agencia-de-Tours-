# JohnToursPerú

Web publicitaria fullstack para captar clientes, mostrar tours nacionales e internacionales y gestionar reservas con separación de S/ 200 por Yape.

## Incluye

- Landing adaptable con la paleta azul, turquesa y amarilla del logo.
- Tipografía profesional con Montserrat para títulos y Source Sans 3 para lectura clara.
- Código organizado por responsabilidades: estructura pública, catálogo, secciones, configuración y utilidades.
- Carrusel principal con marco azul de marca y acceso directo desde cada imagen al detalle del paquete.
- Carrusel premium de cinco destinos con navegación, indicadores, duración, precio y acceso directo a cada experiencia.
- Catálogo, filtros, detalle, itinerario, inclusiones y exclusiones de cada tour.
- Tarjetas de tours con valoración referencial, etiquetas, beneficios y consulta rápida por WhatsApp.
- Proceso visual de reserva explicado en seis pasos claros.
- Guía de aerolíneas por destino con logotipos, objetivo de conexión, criterios de decisión y enlaces oficiales para comparar precio final, horarios, equipaje y escalas.
- Diseño minimalista con tarjetas jerarquizadas, iconografía profesional y microinteracciones alineadas con la paleta del logo.
- Mejor época para viajar, calendario por tour y salidas programadas.
- Reserva pendiente con código privado, QR informativo y mensaje formal de WhatsApp.
- Estados visibles desde la creación hasta la confirmación.
- Constancia PDF demostrativa con logo, resumen económico, saldo, itinerario día por día, incluidos, exclusiones y extras opcionales; actualmente no representa una boleta tributaria ni un cobro real.
- Guías PDF adicionales por destino, visibles únicamente después de confirmar.
- Panel interno en `/admin` con roles `ADMIN` y `WORKER`, accesible solo por ruta directa y sin promoción en la navegación pública.
- Pie de página completo con destinos, redes oficiales, medios de pago, información legal y acceso interno discreto.
- Protección temporal de la solicitud y validación profesional de Yape con archivo, fecha, monto, código, trabajador e historial.
- Seguridad con JWT, rate limiting, CORS, cabeceras, validación Zod y variables de entorno.

## Tecnología

- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS, React Query y jsPDF.
- Backend: Node.js, Express, TypeScript, Prisma y MySQL.
- Atención y comprobantes: Yape manual + enlaces oficiales de WhatsApp.

## Inicio local

```bash
npm run install:all
npm run prisma:generate
npm run dev:backend
npm run dev:frontend
```

Copiar y completar `frontend/.env.example` y `backend/.env.example`. Aplicar las migraciones Prisma antes de iniciar con una base nueva o existente.

## Validación

```bash
npm run build:all
npm run test --prefix backend
npm audit --omit=dev
npm audit --omit=dev --prefix backend
```

Documentación: [funciones y arquitectura](docs/documentacion-web.md) y [checklist de producción](docs/production-checklist.md).

> La web no realiza transferencias ni envía mensajes automáticamente. El cliente registra su constancia segura y decide si avisa por WhatsApp; el personal autorizado valida el pago desde el panel.
