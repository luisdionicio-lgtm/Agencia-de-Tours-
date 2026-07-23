# Documentación de la web John Tours Perú

## 1. Objetivo

La web presenta a John Tours como una agencia cercana, organizada y confiable. Su recorrido principal convierte una visita publicitaria en una consulta, una selección de tour, una reserva y una confirmación acompañada por un asesor.

## 2. Experiencia pública

### Inicio

- Encabezado adaptable con navegación, logo oficial y acceso a reservas.
- Hero publicitario con buscador, propuesta de valor y llamados a WhatsApp.
- Indicadores de confianza: asistencia, precios transparentes y protección de datos.
- Secciones de acompañamiento, proceso de compra, destinos y tours destacados.
- Bloque de beneficios exclusivos que explica qué recibe el cliente después de reservar.
- Guía de verificación para comprar informado y reconocer los canales oficiales.
- Experiencias por estilo de viaje, promociones escolares y viajes grupales.
- Historia de la empresa, redes sociales, testimonios y preguntas frecuentes.
- Botón flotante de WhatsApp disponible durante la navegación.

### Catálogo y detalle

- Filtros por tipo de viaje, destino y precio máximo.
- Tarjetas con imagen, precio, duración, cupos y moneda.
- Página individual con galería, descripción, itinerario, inclusiones y exclusiones.
- Acciones para reservar o solicitar una cotización humana.

## 3. Reserva y pago

1. El cliente selecciona un tour.
2. Registra datos de contacto, documento, fecha y cantidad de viajeros.
3. El sistema crea una reserva pendiente.
4. Se presenta una separación de S/ 200, QR informativo y código único.
5. El cliente envía el comprobante por el canal oficial de WhatsApp.
6. Un asesor valida titular, monto y código antes de confirmar el cupo.
7. La confirmación desbloquea beneficios y una guía PDF específica del destino.
8. El cliente puede elegir fecha, hora, modalidad y tema para preparar una cita con un asesor.
9. El sistema genera un mensaje formal con reserva, código de separación y referencia al comprobante; nunca lo envía automáticamente.

El modo demostración permite recorrer el flujo sin ejecutar un cobro ni registrar una operación bancaria.

## 4. Contenido exclusivo posterior al pago

- Imagen referencial vinculada al destino reservado.
- Lista de servicios adicionales pertinentes al viaje.
- Guía PDF con identidad de John Tours y explicación de cada opción.
- Guías preparadas para Cusco, Orlando, Oxapampa, Ica y Egipto.
- Documento general de respaldo para tours nuevos que aún no tengan guía propia.

Los extras se cotizan por separado, están sujetos a disponibilidad y no aparecen en el catálogo principal para mantener clara la propuesta inicial.

## 5. Administración

- Autenticación administrativa.
- Alta, edición y desactivación de tours.
- Gestión de precio, moneda, modalidad de pago, cupos, imágenes e itinerarios.
- Consulta de reservas y pagos.
- Configuración empresarial y políticas publicadas.
- Fallback local para demostraciones cuando la API no está disponible.

## 6. Arquitectura

### Frontend

- Next.js 15 y React 18.
- TypeScript, Tailwind CSS y Bootstrap.
- React Query para datos remotos.
- React Hook Form y Zod para formularios.
- Axios para comunicación con la API.

### Backend

- Node.js, Express y TypeScript.
- Prisma ORM y MySQL.
- Servicios separados para autenticación, tours, reservas, pagos, operaciones, correo y contacto.
- Validación, manejo centralizado de errores y protección de rutas administrativas.
- Pruebas de operaciones críticas.

## 7. Seguridad y confianza

- El frontend no almacena claves privadas de pago.
- El backend recalcula importes desde la reserva.
- No se deben guardar claves de Yape, códigos SMS ni contraseñas bancarias.
- Los pagos reales requieren credenciales propias, webhook, auditoría y pruebas previas.
- Las políticas de cancelación, cambios, privacidad y reembolso deben publicarse con aprobación empresarial.
- Las fotografías definitivas deben ser propias o contar con permiso de uso.

## 8. Archivos relevantes

- `frontend/src/features/tours/TourApplication.tsx`: experiencia pública, reserva, pago y administración.
- `frontend/src/index.css`: sistema visual y comportamiento adaptable.
- `backend/src`: API y lógica de negocio.
- `backend/prisma`: modelo y migraciones de base de datos.
- `scripts/generate_destination_guides.py`: generación de guías PDF.
- `scripts/prepare_whatsapp_appointment.py`: validación y preparación de mensajes de cita sin envío automático.
- `frontend/public`: identidad, recursos visuales y PDFs descargables.
- `docs/production-checklist.md`: requisitos para vender y desplegar.

## 9. Pendientes para producción

- Confirmar razón social, RUC, dominio y Libro de Reclamaciones.
- Sustituir imágenes referenciales por contenido autorizado de la empresa.
- Configurar Yape/Culqi, correo SMTP, base de datos y copias de seguridad.
- Publicar precios, fechas, cupos y condiciones comerciales definitivas.
- Cambiar todas las credenciales demostrativas.
- Añadir analítica, monitoreo de errores, SEO técnico y pruebas de accesibilidad.
- Validar el flujo completo con pagos de prueba antes de aceptar dinero real.

## 10. Implementación futura confirmada

- Registrar y conectar el dominio oficial de John Tours con HTTPS y configuración DNS segura.
- Desplegar frontend, API y MySQL en servicios de hosting productivos con copias de seguridad y monitoreo.
- Crear correos corporativos para reservas, ventas, soporte y administración cuando exista el dominio definitivo.
- Configurar SMTP, SPF, DKIM y DMARC antes de mostrar esos correos en la web.
- Sustituir los contactos demostrativos únicamente después de verificar que cada cuenta corporativa funciona correctamente.

Estas funciones se añadirán a la web en una etapa posterior. No se publicarán direcciones de correo provisionales ni datos empresariales que todavía no hayan sido confirmados.
