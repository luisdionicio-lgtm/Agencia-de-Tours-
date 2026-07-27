# Documentación funcional y técnica — John Tours Perú

## Objetivo

La web funciona como una vitrina publicitaria breve: presenta confianza, permite comparar tours y conduce al visitante hacia una reserva acompañada. Conserva la identidad visual del logo y el catálogo existente.

## Recorrido público

1. El visitante conoce la propuesta, historia, canales oficiales y redes sociales.
2. Filtra tours nacionales o internacionales y revisa el paquete.
3. Completa sus datos, fecha y número de viajeros.
4. El backend crea una reserva `PENDIENTE`; todavía no descuenta cupos.
5. La web muestra S/ 200, código de separación, QR e instrucciones de Yape.
6. Al preparar el envío se registra un comprobante `PENDIENTE` mediante el token privado de la reserva.
7. WhatsApp se abre con un mensaje formal prellenado; el usuario adjunta la constancia y decide enviarla.
8. Un administrador o trabajador valida o rechaza el pago.
9. Al confirmar, la reserva pasa a `PAGADA` y los cupos se descuentan una sola vez.
10. La confirmación habilita el comprobante PDF, la guía del destino, extras y la preparación de una cita.

Estados comunicados al cliente:

- Reserva creada.
- Pago Yape pendiente o enviado.
- Comprobante generado.
- Validación pendiente.
- Reserva confirmada.

## Comprobantes y contenido posterior

El comprobante dinámico por reserva incluye logo, código, cliente, contacto, paquete, destino, fecha, viajeros, método Yape, monto, estado, itinerario, especificaciones, extras y contacto oficial.

Las guías por destino son documentos adicionales y conservan imagen referencial a color, logo y servicios opcionales. Existen variantes para Cusco, Orlando, Oxapampa, Ica y Egipto, más una guía general. Los extras no se presentan como incluidos en el precio principal.

El mensaje para solicitar cita contiene código, reserva, destino, viajeros, fecha, separación, modalidad y tema. En modo demostración solo se visualiza o copia.

## Panel interno

Ruta discreta: `/admin`. No se publica en la navegación comercial y no contiene credenciales predefinidas.

- `ADMIN`: tours, configuración empresarial, reservas y pagos.
- `WORKER`: reservas, comprobantes Yape, confirmación, rechazo y cancelación.

Las cuentas se crean desde el seed y variables de entorno. `ENABLE_DEMO_STAFF` debe permanecer desactivado en producción.

## Cupos e idempotencia

- Crear una reserva no modifica cupos.
- Confirmar un pago Yape usa una transacción Prisma.
- La actualización exige que pago y reserva sigan pendientes.
- El descuento exige disponibilidad suficiente.
- Repetir una confirmación devuelve conflicto y no descuenta nuevamente.
- Rechazar un comprobante no modifica cupos.
- Cancelar una reserva pagada devuelve sus cupos una sola vez.
- Los cupos nunca se decrementan mediante valores enviados por el frontend.

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
- `YAPE_RESERVATION_AMOUNT`
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
