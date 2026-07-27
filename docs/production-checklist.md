# John Tours Perú — Checklist de producción

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

- Crear reserva: los cupos no cambian.
- Registrar Yape: el pago queda pendiente.
- Confirmar una vez: descuenta exactamente el número de viajeros.
- Confirmar otra vez: responde conflicto y no descuenta.
- Rechazar: no descuenta.
- Cancelar pagada: devuelve cupos una sola vez.
- Descargar comprobante PDF y revisar logo, datos, itinerario y extras.
- Confirmar que WhatsApp solo abre el mensaje y nunca lo envía automáticamente.
- Verificar permisos de `ADMIN` y `WORKER`.

## Datos empresariales

- Confirmar razón social, RUC, dirección y Libro de Reclamaciones.
- Validar número y titular de Yape antes de mostrarlo.
- Publicar términos, privacidad, cancelaciones y reembolsos aprobados.
- Crear `reservas@`, `ventas@`, `soporte@` y `administracion@`.
- Configurar SMTP, SPF, DKIM y DMARC.
- Reemplazar imágenes referenciales y testimonios de muestra.

## Operación

- Acceso interno: `/admin`.
- No publicar credenciales ni enlazar el panel desde la landing.
- Revisar pagos Yape contra la constancia antes de confirmar.
- Mantener registro de cancelaciones y devoluciones.
- Revisar periódicamente dependencias, logs, copias y cuentas del personal.
