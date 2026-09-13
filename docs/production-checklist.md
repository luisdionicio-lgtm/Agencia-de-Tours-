# JohnToursPerú — Checklist de producción

## Catálogo y operación real

- Sin `NEXT_PUBLIC_API_URL`, se conserva el catálogo de presentación y la acción de reserva lleva a solicitar una propuesta por WhatsApp. No se crean reservas locales como si fueran operaciones reales.
- Con una API configurada y `NEXT_PUBLIC_DEMO_MODE=false`, catálogo, precios y disponibilidad provienen exclusivamente del servidor. Una caída de la API muestra reintento y contacto, sin agregar tours de muestra.
- La demostración solo se activa con `NEXT_PUBLIC_DEMO_MODE=true` durante el build. `?demo=1` y las sesiones antiguas no activan simulaciones en producción. La demo bloquea las peticiones a la API, incluidos los comprobantes.
- Desplegar primero la API actualizada: el frontend usa `POST /api/reservations/:id/status` para verificar reservas mediante su token privado en el cuerpo. Este endpoint devuelve un resumen limitado y no entrega documentos de identidad ni archivos de pago.
- El cliente debe conservar la pestaña donde creó la reserva. Si pierde esa sesión, debe contactar al asesor; no hay recuperación automática por correo en esta versión.
- La vista de pago consulta el estado cada 15 segundos mientras está pendiente. Solo un estado `PAGADA` verificado habilita la confirmación real.
- El panel consulta `/api/admin/tours` para gestionar también tours inactivos. Los fallos de escritura conservan el formulario y muestran error; no se informa un guardado ficticio.
- Las salidas vencidas se excluyen del formulario. La API vuelve a validar fechas, salidas y cupos antes de crear la reserva.
- Revisar `NEXT_PUBLIC_WHATSAPP_NUMBER`: el número visible y los enlaces se generan desde la misma variable. El valor del entorno prevalece sobre el número de respaldo del código.
- Las constancias conservan la moneda del paquete. Un adelanto en soles no se resta directamente de un total en dólares: la conversión queda por confirmar con el asesor.

Validación local: `npm run build:all`, `npm run test --prefix backend`, `npm run lint --prefix frontend` y `npm run test:content --prefix frontend`. Las pruebas de acceso usan dobles de base de datos; antes del lanzamiento se debe ejecutar además el circuito real con MySQL, almacenamiento de comprobantes y validación del personal en un entorno de pruebas.

## Infraestructura

- Frontend Next.js publicado con HTTPS.
- API Express separada y accesible solo por su URL oficial.
- MySQL administrado, migraciones aplicadas y copias de seguridad automáticas.
- Dominio y DNS bajo una cuenta empresarial con renovación controlada.
- Monitoreo de disponibilidad, errores y consumo de recursos.

## Variables

Frontend:

```env
NEXT_PUBLIC_API_URL=https://api.dominio-oficial.pe/api
NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
NEXT_PUBLIC_DEMO_MODE=false
```

Backend:

```env
PORT=4000
NODE_ENV=production
DATABASE_URL=mysql://usuario:clave@host:3306/john_tours
FRONTEND_URL=https://dominio-oficial.pe
JWT_SECRET=secreto_unico_largo_y_aleatorio
JWT_EXPIRES_IN=8h
JWT_ISSUER=johntours-api
JWT_AUDIENCE=johntours-staff
BCRYPT_SALT_ROUNDS=12
YAPE_RESERVATION_AMOUNT=200
ENABLE_DEMO_STAFF=false
ADMIN_EMAIL=administracion@dominio-oficial.pe
ADMIN_PASSWORD=clave_unica_de_al_menos_16_caracteres
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=reservas@dominio-oficial.pe
```

No guardar `.env`, tokens, contraseñas, QR privados ni credenciales bancarias en Git.

## Base de datos

```bash
cd backend
npm run prisma:generate
npx prisma migrate deploy
npm run seed
```

- Verificar que la migración `staff_yape_workflow` creó `WORKER` y `public_token`.
- Ejecutar el seed con credenciales empresariales.
- Habilitar `ENABLE_DEMO_STAFF` únicamente en un entorno de demostración aislado.
- Probar respaldo y restauración antes de publicar.

## Pruebas obligatorias

```bash
npm run build:all
npm run test --prefix backend
npm audit --omit=dev
npm audit --omit=dev --prefix backend
```

- Crear reserva: la solicitud queda pendiente y el control interno se actualiza una vez.
- Registrar Yape: el pago queda pendiente.
- Confirmar una vez: procesa exactamente una reserva.
- Confirmar otra vez: responde conflicto y no vuelve a procesar.
- Rechazar o cancelar: revierte el control interno una sola vez.
- Descargar comprobante PDF y revisar logo, datos, itinerario y extras.
- Confirmar que WhatsApp solo abre el mensaje y nunca lo envía automáticamente.
- Verificar permisos de `ADMIN` y `WORKER`.
- Supervisar `/api/health/ready`: debe responder `200` con la base disponible y `503` cuando no pueda aceptar tráfico.
- Confirmar que un token vencido, alterado o emitido para otra audiencia responde `401` y nunca expone detalles internos.

## Datos empresariales

- Confirmar razón social, RUC, dirección y Libro de Reclamaciones.
- Validar número y titular de Yape antes de mostrarlo.
- Publicar términos, privacidad, cancelaciones y reembolsos aprobados.
- Crear `reservas@`, `ventas@`, `soporte@` y `administracion@`.
- Configurar SMTP, SPF, DKIM y DMARC.
- Reemplazar las imágenes europeas referenciales por material propio o licenciado definitivo.
- Publicar testimonios únicamente cuando exista autorización y evidencia verificable; la versión actual no muestra opiniones ficticias.

## Operación

- Acceso interno: `/admin`.
- No publicar credenciales ni enlazar el panel desde la landing.
- Revisar pagos Yape contra la constancia antes de confirmar.
- Mantener registro de cancelaciones y devoluciones.
- Revisar periódicamente dependencias, logs, copias y cuentas del personal.
