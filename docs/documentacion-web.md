# Documentación funcional y técnica — JhonToursPerú

## Objetivo

La web funciona como una vitrina publicitaria breve: presenta confianza, permite comparar tours y conduce al visitante hacia una reserva acompañada. Conserva la identidad visual del logo y el catálogo existente.

## Recorrido público

1. El visitante conoce la propuesta, historia, canales oficiales y redes sociales.
2. Revisa opciones de aerolíneas mediante enlaces oficiales y compara precio final, horarios, equipaje y conexiones.
3. Filtra tours nacionales o internacionales y revisa el paquete.
4. Elige una fecha programada y completa sus datos.
5. El backend crea una reserva `PENDIENTE` y mantiene temporalmente activa la solicitud.
6. La web muestra S/ 200, código de separación, QR e instrucciones de Yape.
7. El cliente registra código de operación, fecha, monto y un archivo JPG, PNG, WebP o PDF de hasta 5 MB.
8. El servidor valida tipo, tamaño y firma real del archivo; WhatsApp queda como aviso opcional y no se envía automáticamente.
9. Un administrador o trabajador valida o rechaza el pago.
10. Al confirmar, la reserva pasa a `PAGADA` y registra al trabajador responsable.
11. La confirmación habilita el comprobante PDF, la guía del destino, extras y la preparación de una cita.

Estados comunicados al cliente:

- Reserva creada.
- Pago Yape pendiente o enviado.
- Comprobante generado.
- Validación pendiente.
- Reserva confirmada.

## Orientación de vuelos y traslados

La portada incluye un bloque compacto de orientación con enlaces externos a los sitios oficiales de LATAM, SKY y JetSMART para Cusco; Copa Airlines y Avianca para Orlando; e Iberia y Turkish Airlines para El Cairo. No vende pasajes ni garantiza una tarifa: invita a comparar el costo final, equipaje, escalas, horarios y condiciones antes de pagar.

Ica y Oxapampa se presentan como conexiones terrestres desde Lima y se ofrece coordinación por WhatsApp. Los enlaces y rutas deben revisarse periódicamente porque dependen de cada aerolínea.

## Comprobantes y contenido posterior

El comprobante dinámico por reserva incluye logo, código, cliente, contacto, paquete, destino, fecha, viajeros, método Yape, monto, estado, itinerario, especificaciones, extras y contacto oficial.

Las guías por destino son documentos adicionales y conservan imagen referencial a color, logo y servicios opcionales. Existen variantes para Cusco, Orlando, Oxapampa, Ica y Egipto, más una guía general. Los extras no se presentan como incluidos en el precio principal.

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
- Las imágenes y testimonios definitivos requieren autorización o fuente verificable.

## Arquitectura

- `frontend/src/features/tours/TourApplication.tsx`: experiencia pública, reserva, Yape, confirmación y panel.
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
