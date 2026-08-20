# Módulo de tours

La funcionalidad se divide por responsabilidad para que cada mejora pueda realizarse sin afectar el resto del flujo:

- `TourApplication.tsx`: coordinación de páginas públicas, reservas, pagos y panel interno.
- `components/SiteShell.tsx`: cabecera pública, navegación adaptable, pie de página y orientación flotante por WhatsApp.
- `components/PromotionsShowcase.tsx`: carrusel multimedia de promociones referenciales enlazadas a cada paquete.
- `components/TravelArchiveShowcase.tsx`: galería editorial de fotografías propias, destinos reconocidos y precios demo enlazados al catálogo.
- `components/ExperienceProofSection.tsx`: muestra compacta de grupos acompañados con fotografías WebP propias y acceso directo al paquete relacionado.
- `components/TourCard.tsx`: presentación reutilizable del paquete, sus beneficios y el enlace a la ficha completa.
- `components/`: piezas reutilizables del catálogo y la estructura general del sitio.
- `sections/`: apartados completos de la landing, como la orientación de aerolíneas.
- `config/`: datos de contacto, WhatsApp, redes, configuración de demostración y guía estructurada de aerolíneas por destino.
- `config/itineraryCatalog.ts`: 15 modalidades consolidadas a partir de 121 documentos PDF y Word del archivo operativo; contiene resúmenes públicos y programas privados día por día.
- `lib/`: formato de precios, códigos y utilidades de presentación.
- `lib/reservationReceipt.ts`: generación de la constancia PDF demostrativa y separación clara de itinerario, incluidos, exclusiones y opcionales.

Las reglas de negocio y llamadas HTTP permanecen separadas en el backend y en `infrastructure/api`.

La web no publica documentos originales ni datos internos. El catálogo presenta únicamente rutas resumidas y la confirmación demo habilita el detalle de las variantes vinculadas al destino reservado.

El selector del catálogo depende del tipo de tour: muestra solo paquetes nacionales, internacionales o todos, según la categoría activa. Al elegir una opción habilita el botón que abre directamente la ficha correspondiente.
