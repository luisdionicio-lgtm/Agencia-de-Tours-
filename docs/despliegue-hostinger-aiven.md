# Salida a producción de JohnToursPerú

La arquitectura objetivo separa la web pública, la API y la base de datos. Esto permite desplegar cada servicio, probarlo y revertirlo sin afectar los demás.

## Arquitectura

- `www.dominio-de-la-empresa.com`: aplicación Next.js en Hostinger Web Apps, carpeta `frontend`.
- `api.dominio-de-la-empresa.com`: API Node.js en Hostinger Web Apps, carpeta `backend`.
- Aiven MySQL Hobbyist: base de datos privada para tours, salidas, reservas, pagos, usuarios y configuración.
- Hostinger Email Standard: 30 buzones corporativos. La aplicación usa un buzón transaccional dedicado, por ejemplo `reservas@dominio-de-la-empresa.com`.

## Orden recomendado

1. Crear MySQL en Aiven, restringir accesos cuando el proveedor lo permita y copiar la URL TLS en `DATABASE_URL`.
2. Desplegar el backend. Ejecutar `npm ci`, `npm run prisma:generate`, `npm run build`, `npx prisma migrate deploy` y luego `npm start`.
3. Verificar `https://api.dominio-de-la-empresa.com/api/health` antes de conectar la web.
4. Desplegar el frontend con `NEXT_PUBLIC_API_URL=https://api.dominio-de-la-empresa.com/api` y `NEXT_PUBLIC_PRESENTATION_MODE=false`.
5. Conectar el dominio cuando frontend, API, reservas y correos hayan pasado la prueba final.
6. Configurar en DNS los registros MX, SPF, DKIM y DMARC entregados por Hostinger Email.

## Variables del backend

Definir en Hostinger: `NODE_ENV=production`, `DATABASE_URL`, `FRONTEND_URL`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `YAPE_RESERVATION_AMOUNT` y `RESERVATION_HOLD_MINUTES`.

`JWT_SECRET` debe ser aleatorio y tener al menos 32 caracteres. `FRONTEND_URL` debe ser la URL HTTPS exacta. `ENABLE_DEMO_STAFF` debe permanecer en `false`. La URL de Aiven debe exigir TLS según la cadena que entregue el proveedor.

## Variables del frontend

Usar `frontend/.env.example` como plantilla. Antes de abrir ventas, confirmar `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, WhatsApp, correo, ubicación de atención y monto de separación. Con `NEXT_PUBLIC_PRESENTATION_MODE=true`, la prueba no se indexa; cambiarlo a `false` únicamente al publicar el dominio real.

## Correos y responsabilidades

Crear al menos `reservas@`, `ventas@`, `soporte@`, `administracion@`, `pagos@`, `privacidad@` y `no-reply@`. Los demás buzones pueden asignarse al equipo. Usar `no-reply@` como remitente técnico y `reservas@` como dirección de respuesta. Activar doble factor en las cuentas administrativas y no compartir contraseñas entre trabajadores.

## Puerta de salida comercial

Antes de aceptar pagos reales deben estar cargados los datos fiscales de la empresa, políticas legales aprobadas, Libro de Reclamaciones, tarifas vigentes, cupos reales, datos bancarios/Yape del titular autorizado y responsables de atención. Hacer una compra de prueba completa: catálogo, cotización, reserva, comprobante, validación por trabajador, correo, cancelación y auditoría.

Después del lanzamiento, habilitar alertas de disponibilidad para web/API, copias automáticas de Aiven, registro de errores y una revisión mensual de accesos. Mantener separado el dominio público del panel interno y entregar cuentas individuales por rol.
