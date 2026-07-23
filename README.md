# John Tours Perú

Plataforma web fullstack para promocionar, reservar y administrar tours nacionales e internacionales con una experiencia clara, visual y orientada a generar confianza.

## Qué incluye

- Inicio publicitario adaptable a celulares, tablets y computadoras.
- Catálogo con filtros, destinos destacados y detalle de cada paquete.
- Reserva desde S/ 200 mediante Yape, QR informativo y código único.
- Envío del comprobante y atención directa por WhatsApp.
- Beneficios exclusivos desbloqueados después de confirmar el pago.
- Preparación de citas posteriores al pago con mensaje formal y código de separación.
- PDF personalizado por destino con logo, imagen referencial y servicios extra.
- Testimonios, preguntas frecuentes, historia, promociones escolares y redes sociales.
- Panel administrativo para tours, reservas, pagos y datos empresariales.
- Políticas legales y arquitectura preparada para producción.

## Tecnología

- Frontend: Next.js, React, TypeScript, Tailwind CSS y React Query.
- Backend: Node.js, Express, TypeScript, Prisma y MySQL.
- Pagos preparados: Culqi y flujo manual de Yape.

## Ejecución rápida

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

Variables de entorno: copiar y completar los archivos `.env.example` del frontend y backend.

## Validación

```bash
npm run build:all
npm run test --prefix backend
```

La descripción funcional y técnica completa está en [docs/documentacion-web.md](docs/documentacion-web.md). La preparación para producción se detalla en [docs/production-checklist.md](docs/production-checklist.md).

El informe ejecutivo actualizado está disponible en [docs/Informe_Estado_Web_John_Tours_2026.docx](docs/Informe_Estado_Web_John_Tours_2026.docx).

> Los pagos demostrativos no realizan cobros. Antes de vender deben configurarse los datos empresariales, políticas, credenciales y servicios reales.
