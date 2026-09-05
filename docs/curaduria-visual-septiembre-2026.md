# Curaduría visual y rutas — septiembre de 2026

## Alcance real de la revisión

Se inventariaron las carpetas turísticas de E:, priorizando PAGINA WEB y FOTOS PAGINA WEB JOHNTOURS. Se revisaron visualmente seis hojas de contacto con 277 fotos únicas de 539 archivos fotográficos; no se exploraron carpetas de sistema ni se publicaron archivos personales ajenos al viaje. El inventario también encontró 121 documentos, incluyendo versiones duplicadas en PDF y Word. Esto no equivale a validar comercialmente cada documento ni a revisar todos los videos completos.

## Fotografías incorporadas

| Origen | Destino web | Criterio |
|---|---|---|
| FOTOS PAGINA WEB JOHNTOURS/20230916_124418.jpg | Guayaquil y costa ecuatoriana: Montañita | Mural identificable; extensión expresamente sujeta a confirmación |
| FOTOS PAGINA WEB JOHNTOURS/Guayaquil/20241113_105403.jpg | Circuito Cusco–Puno–Arequipa: Yanahuara | La fotografía muestra Arequipa, aunque estaba archivada en Guayaquil |
| fotosjhontours/Camera/20221022_133347.jpg | Circuito sur y Titicaca: Uros | Isla de totora y contexto lacustre visible |
| fotosjhontours/Camera/20221022_161715.jpg | Titicaca: Sillustani | Chullpa y entorno reconocibles; extensión por consultar |
| PAGINA WEB/Pozuzo/20230906_074208.jpg | Galería de Pozuzo: pórtico | Selección explícita del propietario; recuperado el encuadre completo |
| PAGINA WEB/Pozuzo/20230907_104012.jpg | Galería de Pozuzo: experiencia cultural | Selección explícita del propietario |
| PAGINA WEB/Pozuzo/20230908_114927.jpg | Galería de Pozuzo: catarata | Selección explícita del propietario; sin atribuir un nombre de catarata no verificado |

Originales intactos. Copias WebP con orientación corregida, máximo 1600 píxeles por lado, proporción original y sin metadatos EXIF. Sin marcas de agua añadidas. La galería permite ampliar y navegar con teclado, presenta las fotos completas y carga miniaturas de forma diferida. Las fotos publicadas pueden descargarse técnicamente: no se promete protección absoluta. Antes de difusión comercial, la agencia debe confirmar las autorizaciones de imagen de los viajeros, especialmente menores.

## Itinerarios

Se contrastó el documento TOURS EUROPA/EUROPA FANTASTICA. IB 16MAR AL 03ABR JOHNTOURS.pdf. Su contenido dice «Circuito Bienvenidos a Europa», 17 días/15 noches, con fechas de abril de una salida histórica: no coincide con el nombre del archivo. Se añadió la variante Europa con Lucerna y Verona, sin vuelos, fechas, tarifas ni hoteles históricos como oferta vigente. Las excursiones opcionales siguen identificadas como opcionales. Los resúmenes públicos y el detalle de reserva utilizan el catálogo existente, sin cambiar la lógica de pagos.

También se contrastó TOURS BRASIL/TOURS 2026 BRASIL 202666.pdf: el circuito de seis días ya está representado; no se creó un duplicado. No se cambiaron precios por los de documentos históricos.

## Video social

Se revisó el perfil público @johntoursperu y la publicación https://www.tiktok.com/@johntoursperu/video/7677759606340324629, identificada por el propio perfil como cataratas/Tarapoto. Se incorpora únicamente en Tarapoto, con activación voluntaria, sin autoplay y con enlace original de respaldo. El iframe oficial sigue https://developers.tiktok.com/docs/en/embed-player. CSP permite únicamente el dominio www.tiktok.com para este proveedor; no se añaden scripts externos al documento principal.

Instagram mostró el perfil pero exigió inicio de sesión para abrir reels: no se atribuyeron destinos a clips no inspeccionados. Los videos locales de Machu Picchu y Tarapoto se conservaron. La disponibilidad del reproductor externo depende de TikTok y del navegador.

## Presentación e interacción

- Portada: el antiguo mosaico se reemplazó por Momentos del viaje, con filtros por región, expansión de la selección y fotografías enlazadas a los paquetes. Los identificadores y precios se resuelven desde el catálogo recibido, sin mantener otra lista de precios fija.
- Detalle: accesos a resumen, fotos, video e itinerarios; panel de reserva con altura natural.
- Modalidades: selector de opciones con controles de radio nativos, resumen de paradas y consulta por WhatsApp que incluye la modalidad elegida. No se envía ningún mensaje automáticamente ni se modifica la lógica de pagos.
- Galería: vista completa, Escape para cerrar, flechas para navegar, foco contenido por el diálogo nativo y bloqueo temporal de scroll restaurado al cerrar.
- Corrección funcional: Ica deja de coincidir con «amazónica»; las recomendaciones de temporada comparan palabras completas y normalizan tildes.
- Mantenimiento: componentes y estilos modulares, eliminación del componente anterior y de sus reglas CSS sin uso. Prueba `npm run test:content` para nombres de destino, imágenes existentes e itinerarios únicos.
- Rendimiento: 17 vistas previas WebP de hasta 640 píxeles, 940.594 bytes en conjunto frente a 5.054.822 bytes de las versiones grandes (81,4 % menos). Las galerías usan las vistas previas y solicitan la versión grande al ampliar. Se regeneran con `npm run media:previews`.

## Verificación

Compilación de producción, lint y `test:content` correctos. Pruebas de navegador: filtro Ecuador muestra dos experiencias, Montañita abre el paquete de Guayaquil, selector europeo actualiza la consulta de WhatsApp, galería permite avanzar con flechas y cerrar con Escape, sin desbordamiento horizontal en las vistas de detalle probadas a 390 píxeles. TikTok no crea iframe antes de la activación, carga el reproductor al pulsar y lo retira al cerrar. No se efectuaron pagos ni se enviaron mensajes durante las pruebas.
