# JohnToursPerú

Web publicitaria fullstack para captar clientes, mostrar tours nacionales e internacionales y gestionar reservas con separación de S/ 200 por Yape.

## Incluye

- Landing adaptable con la paleta azul, turquesa y amarilla del logo.
- Tipografía profesional con Montserrat para títulos y Source Sans 3 para lectura clara.
- Código organizado por responsabilidades: estructura pública, catálogo, secciones, configuración y utilidades.
- Carrusel principal con marco azul de marca y acceso directo desde cada imagen al detalle del paquete.
- Selector principal con los 15 tours, flechas y pestañas horizontales por nombre para descubrir y abrir cualquier paquete desde la portada sin cambios inesperados de imagen.
- Carrusel premium de cinco destinos con navegación, indicadores, duración, precio y acceso directo a cada experiencia.
- Selección curada de material propio para Cusco–Machu Picchu, Valle Sagrado, Lago Titicaca–Bolivia, Ica–Huacachina, Oxapampa–Pozuzo, Tarapoto y Guayaquil–costa ecuatoriana. Se revisaron las carpetas operativas proporcionadas y se descartaron duplicados, tomas poco claras, material privado y archivos sin valor turístico directo.
- Galería editorial visible «Destinos vividos por nuestro equipo» con siete fotografías propias optimizadas, contexto del lugar, enlace al paquete y precio demo expresamente marcado como referencial.
- Apartado compacto «Viajes reales, acompañamiento que se nota» con grupos atendidos en Machu Picchu, las islas de los Uros y Guayaquil; cada fotografía abre el paquete relacionado.
- Evidencia operativa integrada en el mismo apartado con recepción en aeropuerto y equipo de acompañamiento, sin crear una sección extensa adicional en la portada.
- Galerías específicas dentro de los paquetes de Machu Picchu, Lago Titicaca–Bolivia, Guayaquil, Ica–Huacachina y Oxapampa–Pozuzo; cada fotografía se vincula con una etapa pública del itinerario y no revela horarios ni datos operativos privados.
- Quince nuevas fotografías WebP optimizadas procedentes de las siete carpetas temáticas —Aeropuerto, Bolivia, Cusco, Equipo John, Guayaquil, Ica y Pozuzo—, sin metadatos EXIF/GPS, sin marcas de agua añadidas y sin publicar los originales de alta resolución.
- Un único microvideo seleccionado de Tarapoto (7 segundos, sin audio y menos de 2 MB), disponible en su promoción y detalle con carga bajo demanda. Los clips con primeros planos o transiciones de menor calidad fueron descartados.
- Carrusel editorial de promociones con fotografías, video bajo demanda, comentario, fecha referencial, aviso de demostración y acceso directo al paquete.
- Reel promocional propio de Machu Picchu seleccionado del archivo `E:\REELS VIAJES DE PROMOCIÓN`, recortado a 18 segundos, silenciado y optimizado a aproximadamente 2.2 MB para carga bajo demanda.
- Paquete principal integrado «Cusco, Puno y Arequipa» de 8 días / 7 noches: reúne Cusco, Valle Sagrado, Machu Picchu, Puno, lago Titicaca y Arequipa en una sola propuesta nacional. La ficha pública muestra solo las etapas principales; el itinerario operativo completo, inclusiones y exclusiones se desbloquean en la confirmación y permanecen en la constancia PDF.
- Biblioteca publicitaria de 15 modalidades consolidadas después de revisar 121 documentos del disco E: Cusco, Andes del sur, Tarapoto, norte del Perú, Ecuador, Colombia, Brasil, Argentina, Caribe, Disney y Europa. Se eliminaron duplicados y versiones repetidas.
- Variantes por destino visibles como resúmenes comerciales. El paquete reservable del sur del Perú conserva una sola modalidad combinada para evitar presentarlo erróneamente como un tour exclusivo de Cusco; los programas independientes permanecen solo en la biblioteca documental.
- Catálogo de 15 propuestas reservables: nueve rutas iniciales y seis nuevos paquetes demostrativos para Máncora–Tumbes, Cartagena, Río de Janeiro, Buenos Aires–Iguazú, Punta Cana y Disney–Orlando.
- Fotografías referenciales optimizadas y almacenadas localmente; los créditos externos se conservan debajo de la imagen cuando corresponden, nunca superpuestos como marca de agua. No se reutilizaron imágenes europeas de procedencia incierta.
- Filtros por tipo, selector de paquetes que muestra únicamente opciones nacionales o internacionales según la categoría elegida, acceso directo a la ficha, itinerarios completos, inclusiones, exclusiones, temporada recomendada y fechas referenciales de cada tour.
- Tarjetas de tours con etiquetas, beneficios e iconografía dimensional alineada con la marca.
- Proceso visual de reserva explicado en seis pasos claros.
- Guía de aerolíneas por destino con logotipos, objetivo de conexión, criterios de decisión y enlaces oficiales para comparar precio final, horarios, equipaje y escalas.
- Diseño minimalista con tarjetas jerarquizadas, iconografía profesional y microinteracciones alineadas con la paleta del logo.
- Acabado visual de marca con aurora interactiva en portada, firma luminosa, movimiento cinematográfico de imágenes, reflejos sutiles en tarjetas y una ruta gráfica para explicar la reserva.
- Mejor época para viajar, calendario por tour y salidas programadas.
- Reserva pendiente con código privado, QR informativo y mensaje formal de WhatsApp.
- Flujo demostrativo seguro para registrar un comprobante ficticio, simular su aprobación y revisar la confirmación sin subir archivos ni enviar mensajes.
- Estados visibles desde la creación hasta la confirmación.
- Constancia PDF demostrativa con logo, resumen económico, saldo, itinerario día por día, incluidos, exclusiones y extras opcionales; actualmente no representa una boleta tributaria ni un cobro real.
- Guías PDF adicionales por destino, visibles únicamente después de confirmar.
- Panel interno en `/admin` con roles `ADMIN` y `WORKER`, accesible solo por ruta directa y sin promoción en la navegación pública.
- Pie de página completo con destinos, redes oficiales, medios de pago, información legal y acceso interno discreto.
- Protección temporal de la solicitud y validación profesional de Yape con archivo, fecha, monto, código, trabajador e historial.
- Seguridad con JWT, rate limiting, CORS, cabeceras, validación Zod y variables de entorno.
- SEO técnico con metadatos sociales, datos estructurados, sitemap, robots y manifiesto instalable.
- Carga optimizada con fuentes locales, fondo WebP liviano, caché de consultas y presentación inicial de marca.
- Accesibilidad con salto directo al contenido, foco visible y compatibilidad con movimiento reducido.
- Los efectos decorativos se simplifican en pantallas táctiles y se desactivan cuando el navegador solicita movimiento reducido.

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

> Los paquetes, fechas y precios actuales son una estructura demostrativa. Todo importe supuesto se identifica como `Precio demo` o `referencial` y debe confirmarse antes de publicarse como oferta comercial. Las fotografías seleccionadas provienen del archivo proporcionado; antes del lanzamiento con dominio propio debe confirmarse la autorización de uso de imagen de las personas visibles.

> Los itinerarios se consolidaron desde archivos PDF y Word proporcionados. Antes de comercializarlos deben validarse vigencia, proveedor, vuelos, hoteles, accesos, orden de actividades, documentación migratoria y precio final.
