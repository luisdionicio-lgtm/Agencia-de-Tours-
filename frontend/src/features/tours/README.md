# Módulo de tours

La funcionalidad se divide por responsabilidad para que cada mejora pueda realizarse sin afectar el resto del flujo:

- `TourApplication.tsx`: coordinación de páginas públicas, reservas, pagos y panel interno.
- `components/SiteShell.tsx`: cabecera pública, navegación adaptable, pie de página y orientación flotante por WhatsApp.
- `components/PromotionsShowcase.tsx`: carrusel multimedia de promociones referenciales enlazadas a cada paquete.
- `components/TravelArchiveShowcase.tsx`: galería editorial de fotografías propias, destinos reconocidos y precios demo enlazados al catálogo.
- `components/`: piezas reutilizables del catálogo y la estructura general del sitio.
- `sections/`: apartados completos de la landing, como la orientación de aerolíneas.
- `config/`: datos de contacto, WhatsApp, redes, configuración de demostración y guía estructurada de aerolíneas por destino.
- `lib/`: formato de precios, códigos y utilidades de presentación.
- `lib/reservationReceipt.ts`: generación de la constancia PDF demostrativa y separación clara de itinerario, incluidos, exclusiones y opcionales.

Las reglas de negocio y llamadas HTTP permanecen separadas en el backend y en `infrastructure/api`.
