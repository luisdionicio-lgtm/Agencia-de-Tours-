# Documentación funcional y técnica — JohnToursPerú

## Material audiovisual curado

El catálogo y la galería pública utilizan material derivado del archivo audiovisual propio para Machu Picchu, Valle Sagrado, Lago Titicaca–Bolivia, Ica y Huacachina, Oxapampa–Pozuzo, Tarapoto y Guayaquil. La revisión final cubrió las siete carpetas temáticas proporcionadas: Aeropuerto, Bolivia, Cusco, Equipo John, Guayaquil, Ica y Pozuzo. Se evaluaron 80 fotografías, se descartaron duplicados, tomas poco claras y material sin valor turístico directo, y se publicaron 15 derivados seleccionados. Las copias públicas se encuentran en `frontend/public/operations/` y `frontend/public/tour-galleries/`, además de las colecciones editoriales ya existentes; fueron convertidas a WebP, redimensionadas y guardadas sin metadatos de ubicación.

Las imágenes de Bolivia, Cusco, Guayaquil, Ica y Pozuzo aparecen únicamente en la ficha del paquete que corresponde a su ruta. Sus títulos describen etapas públicas —por ejemplo, centro histórico, visita principal, recorrido urbano o actividad cultural— sin mostrar horarios, proveedores ni indicaciones operativas privadas. Las carpetas Aeropuerto y Equipo John se presentan como evidencia de recepción y acompañamiento dentro del bloque de experiencias reales de la portada, no como destinos comercializables.

Los originales permanecen fuera del repositorio. La marca visible ayuda a identificar la procedencia, pero no impide capturas de pantalla; la protección principal depende de conservar los originales en almacenamiento privado y publicar únicamente derivados optimizados. Las imágenes con grupos o menores no deben incorporarse hasta confirmar la autorización correspondiente.

La selección de video se limita a un microclip de Tarapoto: toma aérea estable, sin audio, de 7 segundos y menos de 2 MB. Se carga únicamente cuando el visitante decide reproducirlo desde la promoción o el detalle del paquete (`preload="none"`). Los clips de Cusco e Ica evaluados fueron descartados porque contenían transiciones con primeros planos y no cumplían el estándar de privacidad y continuidad visual.

El bloque anteriormente destinado a testimonios de demostración fue reemplazado por un carrusel editorial de promociones. Puede mostrar fotografías o el microvideo aprobado, comentario comercial, periodo referencial y enlace al paquete. Todos los mensajes se identifican como contenido demostrativo y aclaran que precio, fecha, disponibilidad y servicios deben validarse con un asesor; no se presentan opiniones ficticias como experiencias reales.

Machu Picchu incorpora un reel propio seleccionado de `REEL CUSCO - SANTIAGO APOSTOL.mp4`. La copia web conserva la identificación incluida en el archivo original, no incluye audio y fue reducida a 18 segundos y resolución 960 × 540 para evitar publicar el original de 445 MB. Este material forma parte del paquete nacional integrado «Cusco, Puno y Arequipa», no de una propuesta aislada de Cusco. La modalidad pública utiliza una estructura de 7 días / 6 noches tomada del programa combinado 2026; el detalle diario, horarios, traslados, inclusiones y exclusiones se habilita después de la reserva y en la constancia PDF.

Las imágenes externas solo pueden proceder de bancos con licencia explícita o repositorios abiertos, como Unsplash o Wikimedia Commons, con su crédito correspondiente. No se deben descargar ni copiar fotografías de agencias, blogs o resultados de Google sin verificar licencia. Para Machu Picchu se mantiene como imagen principal el archivo propio de JohnToursPerú. El nuevo paquete de Punta Sal utiliza una [toma de DIOHER_PAVAL](https://commons.wikimedia.org/wiki/File:PUNTA_SAL_-_panoramio.jpg) publicada con [licencia CC BY 3.0](https://creativecommons.org/licenses/by/3.0/); la copia pública se convirtió a WebP, se eliminó la metadata y el crédito se muestra como texto independiente.

El catálogo incorpora tres propuestas europeas estructurales: Sueños de Europa 17 días/15 noches (España, Francia, Suiza e Italia), Italia clásica (Roma, Florencia y Venecia), y España–Portugal (Madrid, Barcelona y Lisboa). Incluyen itinerario, inclusiones, exclusiones, temporada recomendada y fechas demostrativas. Sus fotografías WebP son referenciales, proceden de Unsplash y llevan crédito textual. Deben sustituirse por material propio o licenciado definitivo antes de una campaña comercial real.

## Criterio de actualización de programas

Se inventariaron las doce carpetas cuyo nombre empieza con `TOURS` en el disco E. Once contienen documentos y `TOURS NORTE ROYAL DECAMERON` está vacía; el programa equivalente se recuperó de `TOURS NORTE PERU ECUADOR`. Para cada ruta se prioriza el archivo con el año o temporada de viaje más reciente sobre una copia antigua modificada posteriormente. El catálogo demostrativo quedó en 17 paquetes e incorpora las rutas Cusco–Ica–Lima 2027 y Punta Sal–Chiclayo.

La interfaz publica únicamente el resumen comercial. Se omiten nombres de colegios o grupos, teléfonos incluidos en documentos, horarios internos, datos de pasajeros, condiciones de crédito y detalles contractuales. Los importes extraídos de los programas siguen marcados como referenciales hasta que JohnToursPerú confirme vuelos, hoteles, accesos y vigencia comercial.

Los nombres, duraciones, itinerarios y tarifas actuales funcionan como demostración estructural. Cuando existe un importe supuesto, la interfaz lo identifica como `Precio demo` y `referencial`; debe sustituirse o confirmarse antes de una campaña comercial real.

## Objetivo

La web funciona como una vitrina publicitaria breve: presenta confianza, permite comparar tours y conduce al visitante hacia una reserva acompañada. Conserva la identidad visual del logo y el catálogo existente.

## Acabado visual y movimiento

La portada incorpora una iluminación ambiental que responde al puntero sin provocar renderizados de React, una firma de color bajo el nombre JohnToursPerú y un acceso directo a la sección de destinos. Los carruseles aplican un desplazamiento visual cinematográfico muy leve a las fotografías activas, mientras las tarjetas utilizan reflejos y profundidad únicamente al interactuar.

El proceso de reserva presenta una ruta gráfica entre pasos en escritorio. En tablet y móvil se eliminan los conectores y el indicador inferior de la portada para evitar saturación. La consulta `prefers-reduced-motion` desactiva auroras, desplazamientos, ampliaciones y animaciones decorativas para respetar las preferencias de accesibilidad del visitante.

## Recorrido público

1. El visitante conoce la propuesta, historia, canales oficiales y redes sociales.
2. Revisa el objetivo de conexión de cada destino, compara criterios prácticos y accede a las aerolíneas mediante enlaces oficiales.
3. Filtra tours nacionales o internacionales y revisa el paquete.
4. Elige una fecha programada y completa sus datos.
5. El backend crea una reserva `PENDIENTE` y mantiene temporalmente activa la solicitud.
6. La web muestra S/ 200, código de separación, QR e instrucciones de Yape.
7. El cliente registra código de operación, fecha, monto y un archivo JPG, PNG, WebP o PDF de hasta 5 MB.
8. El servidor valida tipo, tamaño y firma real del archivo; WhatsApp queda como aviso opcional y no se envía automáticamente.
9. Un administrador o trabajador valida o rechaza el pago.
10. Al confirmar, la reserva pasa a `PAGADA` y registra al trabajador responsable.
11. La confirmación simulada habilita la constancia PDF demostrativa, la guía del destino, extras y la preparación de una cita.

Estados comunicados al cliente:

- Reserva creada.
- Pago Yape pendiente o enviado.
- Comprobante generado.
- Validación pendiente.
- Reserva confirmada.

## Orientación de vuelos y traslados

La portada incluye una guía de decisión con los logotipos de LATAM, SKY y JetSMART para el circuito Cusco–Puno–Arequipa y para Tarapoto, además de LATAM y Avianca para Guayaquil. El circuito del sur propone entrar por Cusco, continuar por tierra hacia Puno y finalizar en Arequipa para evitar retrocesos; los vuelos, horarios y puntos de entrada o salida se confirman en la propuesta final. Cada opción conserva su identidad visual dentro de una tarjeta adaptada a la paleta de JohnToursPerú y enlaza al sitio oficial. La web no vende pasajes ni garantiza una tarifa.

Ica, Oxapampa y Pozuzo se presentan como conexiones terrestres desde Lima y se ofrece coordinación por WhatsApp. Los enlaces y rutas deben revisarse periódicamente porque dependen de cada aerolínea.

## Comprobantes y contenido posterior

La constancia dinámica incluye logo, código, cliente, contacto, paquete, destino, fecha, viajeros, resumen económico, separación, saldo, estado, itinerario detallado, incluidos, exclusiones, extras opcionales y contacto oficial. En la versión actual se marca como demostración, sin cobro real y sin valor tributario. Una boleta electrónica real requerirá posteriormente los datos fiscales definitivos y la integración autorizada que se seleccione.

Los itinerarios actuales son referenciales y sirven para demostrar la presentación día por día. Se reemplazarán con horarios, proveedores, puntos de encuentro y condiciones confirmadas cuando la empresa entregue la información comercial final.

Las guías por destino son documentos adicionales y conservan imagen referencial a color, logo y servicios opcionales. Existen variantes para Cusco, Oxapampa–Pozuzo e Ica; Guayaquil y Tarapoto utilizan temporalmente la guía general hasta recibir información comercial definitiva. Los extras no se presentan como incluidos en el precio principal.

El mensaje para solicitar cita contiene código, reserva, destino, viajeros, fecha, separación, modalidad y tema. En modo demostración solo se visualiza o copia.

## Panel interno

Ruta discreta: `/admin`. No se publica en la navegación comercial y no contiene credenciales predefinidas.

- `ADMIN`: tours, configuración empresarial, reservas y pagos.
- `WORKER`: reservas, comprobantes Yape, confirmación, rechazo y cancelación.

Las cuentas se crean desde el seed y variables de entorno. `ENABLE_DEMO_STAFF` debe permanecer desactivado en producción.

## Salidas e idempotencia

- Cada tour muestra su mejor época referencial y un calendario de salidas.
- La web pública no presenta los paquetes como una venta por espacios ni muestra cantidades de cupos.
- Crear una reserva mantiene la solicitud activa durante `RESERVATION_HOLD_MINUTES` (30 minutos por defecto).
- Si el tiempo vence, la solicitud pendiente se cancela al consultar o procesar operaciones.
- Confirmar un pago Yape usa una transacción Prisma.
- La actualización exige que pago y reserva sigan pendientes.
- La capacidad permanece como control operativo interno y nunca como argumento comercial público.
- Repetir una confirmación devuelve conflicto y no procesa la reserva nuevamente.
- Rechazar o cancelar conserva la consistencia del control interno.

El panel interno puede conservar fechas, alertas y capacidad para organización del personal. El administrador puede programar nuevas salidas con inicio, fin y capacidad.

## Auditoría Yape

- El comprobante se guarda en la base de datos y solo puede descargarse con sesión de personal.
- Se registran monto, código, fecha del pago, fecha de validación y trabajador responsable.
- El historial conserva envío, aprobación, rechazo, cancelación y vencimiento del bloqueo.
- Los archivos se sirven con `nosniff` y nombre saneado.

## Seguridad

- JWT para personal interno y permisos por rol.
- Token UUID privado por reserva para registrar el comprobante sin exponer datos mediante un ID simple.
- Contraseñas con bcrypt y credenciales solo en backend/seed.
- Rate limiting general, reforzado en login y registro Yape.
- CORS restringido al frontend configurado.
- Cabeceras de seguridad en frontend y API.
- Validación Zod de formularios y payloads.
- Token interno y reservas temporales guardados en `sessionStorage`.
- Ninguna clave bancaria, código SMS o contraseña de Yape se almacena.
- Las imágenes definitivas y cualquier testimonio futuro requieren autorización o fuente verificable.

## Arquitectura

- `frontend/src/features/tours/TourApplication.tsx`: coordinación de rutas, experiencia pública, reserva, Yape, confirmación y panel.
- `frontend/src/features/tours/components`: componentes reutilizables del catálogo.
- `frontend/src/features/tours/components/PromotionsShowcase.tsx`: promociones multimedia referenciales y acceso al paquete relacionado.
- `frontend/src/features/tours/components/TravelArchiveShowcase.tsx`: galería editorial con fotografías propias optimizadas, destino reconocido, precio demo y acceso al paquete relacionado.
- `frontend/src/features/tours/components/TourMediaGallery.tsx`: galerías por paquete relacionadas con la ruta pública.
- `frontend/src/features/tours/sections`: apartados completos de la landing.
- `frontend/src/features/tours/config`: contacto, redes, WhatsApp, itinerarios, material visual por destino y configuración de demostración.
- `frontend/src/features/tours/lib`: formato de precios, códigos y utilidades de presentación.
- `frontend/src/index.css`: sistema visual adaptable.
- `frontend/src/infrastructure/api/client.ts`: cliente HTTP y sesión interna.
- `backend/src/services`: reglas de reservas, pagos, tours, correo y operaciones.
- `backend/src/routes/index.ts`: endpoints públicos y protegidos.
- `backend/prisma/schema.prisma`: modelos, roles y estados.
- `backend/prisma/migrations`: evolución reproducible de la base.
- `scripts/generate_destination_guides.py`: guías PDF por destino.
- `scripts/prepare_whatsapp_appointment.py`: construcción y validación del mensaje sin envío.

## Variables principales

Frontend:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_DEMO_MODE`

Backend:

- `DATABASE_URL`, `FRONTEND_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`
- `YAPE_RESERVATION_AMOUNT`, `RESERVATION_HOLD_MINUTES`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `ENABLE_DEMO_STAFF`, `WORKER_EMAIL`, `WORKER_PASSWORD`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

## Pendiente para producción

- Razón social, RUC, dirección, políticas y Libro de Reclamaciones aprobados.
- Número y titular empresarial de Yape verificados.
- Fotografías propias o licenciadas y testimonios autorizados.
- Dominio, HTTPS, hosting de frontend/API y MySQL administrado.
- Copias de seguridad, monitoreo de errores, métricas y alertas.
- Correos corporativos para reservas, ventas, soporte y administración.
- SMTP con SPF, DKIM y DMARC.
- Prueba integral en ambiente de ensayo antes de recibir dinero.
