# Módulo de tours

La funcionalidad se divide por responsabilidad para que cada mejora pueda realizarse sin afectar el resto del flujo:

- `TourApplication.tsx`: coordinación de páginas públicas, reservas, pagos y panel interno.
- `components/SiteShell.tsx`: cabecera pública, navegación adaptable, pie de página y orientación flotante por WhatsApp.
- `components/`: piezas reutilizables del catálogo y la estructura general del sitio.
- `sections/`: apartados completos de la landing, como la orientación de aerolíneas.
- `config/`: datos de contacto, WhatsApp, redes y configuración de demostración.
- `lib/`: formato de precios, códigos y utilidades de presentación.

Las reglas de negocio y llamadas HTTP permanecen separadas en el backend y en `infrastructure/api`.
