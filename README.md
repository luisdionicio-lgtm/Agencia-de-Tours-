# JhonToursPerú

Web publicitaria fullstack para captar clientes, mostrar tours nacionales e internacionales y gestionar reservas con separación de S/ 200 por Yape.

## Incluye

- Landing adaptable con la paleta azul, turquesa y amarilla del logo.
- Catálogo, filtros, detalle, itinerario, inclusiones y exclusiones de cada tour.
- Guía breve de aerolíneas por destino con enlaces oficiales para comparar precio final, horarios, equipaje y conexiones.
- Mejor época para viajar, calendario por tour y salidas programadas.
- Reserva pendiente con código privado, QR informativo y mensaje formal de WhatsApp.
- Estados visibles desde la creación hasta la confirmación.
- Comprobante PDF por reserva con logo, cliente, tour, fecha, viajeros, pago, itinerario y extras.
- Guías PDF adicionales por destino, visibles únicamente después de confirmar.
- Panel interno en `/admin` con roles `ADMIN` y `WORKER`.
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
