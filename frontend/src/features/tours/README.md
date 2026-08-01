# Módulo de tours

La funcionalidad se divide por responsabilidad para que cada mejora pueda realizarse sin afectar el resto del flujo:

- `TourApplication.tsx`: navegación y coordinación de páginas públicas, reservas, pagos y panel interno.
- `components/`: piezas reutilizables del catálogo, como las tarjetas de cada tour.
- `sections/`: apartados completos de la landing, como la orientación de aerolíneas.
- `config/`: datos de contacto, WhatsApp, redes y configuración de demostración.
- `lib/`: formato de precios, códigos y utilidades de presentación.

Las reglas de negocio y llamadas HTTP permanecen separadas en el backend y en `infrastructure/api`.
