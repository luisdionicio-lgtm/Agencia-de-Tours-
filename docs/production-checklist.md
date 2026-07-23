# John Tours - Checklist de produccion

## Stack aprobado

- Frontend: Next.js + TypeScript + Tailwind CSS.
- Backend: Node.js + Express + TypeScript.
- Base de datos: MySQL + Prisma.
- Admin BD: MySQL Workbench.
- Pagos: Culqi Checkout/API y Yape mediante Culqi.
- Correos: SMTP para confirmaciones.
- WhatsApp: enlaces `wa.me`, sin API oficial por ahora.
- Deploy recomendado: Vercel para frontend, Railway/Render para backend y MySQL administrado.

## Variables de entorno

Frontend (`frontend/.env` o Vercel):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_xxxxxxxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
```

Backend (`backend/.env`):

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=mysql://root:password@localhost:3306/jhon_tours
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
CULQI_API_URL=https://api.culqi.com/v2
CULQI_PRIVATE_KEY=sk_test_xxxxxxxxx
CULQI_WEBHOOK_SECRET=change_this_if_available
ALLOW_DEMO_PAYMENTS=false
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=no-reply@johntours.com
ADMIN_EMAIL=admin@johntours.com
ADMIN_PASSWORD=Admin12345
```

## Reglas de produccion

- No guardar claves reales en Git.
- `CULQI_PRIVATE_KEY` solo vive en backend.
- `NEXT_PUBLIC_CULQI_PUBLIC_KEY` puede vivir en frontend porque es llave publica.
- `ALLOW_DEMO_PAYMENTS=true` solo puede usarse con `NODE_ENV=development`.
- En produccion, si `ALLOW_DEMO_PAYMENTS=true`, el backend falla al iniciar.
- Si falta `CULQI_PRIVATE_KEY`, el backend no aprueba pagos reales y responde un error claro al intentar cobrar.
- Si falta SMTP, la reserva y el pago siguen funcionando, pero el backend advierte que no puede enviar correos.

## Flujos principales

Reserva:

1. Cliente elige tour.
2. Cliente ingresa fecha, datos y cantidad de personas.
3. Backend valida cupos y recalcula total desde MySQL.
4. Backend crea reserva pendiente y descuenta cupos.
5. Sistema intenta enviar correo de reserva recibida.

Pago:

1. Cliente elige tarjeta o Yape.
2. Culqi Checkout genera token.
3. Frontend envia `reservationId` y token al backend.
4. Backend recalcula monto desde la reserva.
5. Backend cobra contra Culqi usando `CULQI_PRIVATE_KEY`.
6. Si Culqi aprueba, la reserva queda pagada y se envia correo de confirmacion.

Admin:

1. Administrador inicia sesion.
2. Admin crea, edita o desactiva tours.
3. Admin revisa reservas, pagos y mensajes.

## Verificaciones antes de vender o desplegar

```bash
npm run build --prefix frontend
npm run build --prefix backend
npm audit --prefix frontend
```

Endpoint de estado del backend:

```text
GET /api/health/integrations
```

Este endpoint indica si Culqi, webhook y SMTP estan configurados sin exponer claves.

## Preguntas pendientes para la empresa

- Tours reales, precios, cupos y fechas programadas.
- Moneda por tour: soles o dolares.
- Pago total o adelanto.
- Cuenta Culqi propia de la empresa.
- Correo SMTP que usaran para confirmaciones.
- Numero oficial de WhatsApp.
- Dominio final.
- Politicas de cancelacion, cambios y reembolsos.

## Fase futura: dominio, hosting y correo corporativo

- Registrar el dominio oficial y definir al responsable de renovación.
- Configurar DNS, HTTPS y URL definitiva para frontend y API.
- Desplegar frontend, backend y MySQL en infraestructura productiva separada del modo demostración.
- Crear cuentas corporativas para reservas, ventas, soporte y administración.
- Configurar SMTP seguro, SPF, DKIM y DMARC.
- Actualizar la web con las direcciones corporativas solo después de verificarlas.
