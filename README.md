# Jhon Tours - Agencia de Turismo

Aplicacion web fullstack profesional para una agencia de tours enfocada en paquetes nacionales e internacionales. Permite explorar destinos, filtrar tours, revisar detalles, crear reservas, simular pagos con Culqi/Yape y administrar reservas desde un panel privado.

## Tecnologias

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, TanStack Query, React Hook Form, Zod y Lucide React.
- Backend: Node.js, Express, TypeScript, Prisma ORM, MySQL, JWT, Bcrypt, Zod, CORS y Axios.
- Base de datos: MySQL con modelos Prisma para usuarios, categorias, tours, imagenes, clientes, reservas, pagos, mensajes y testimonios.

## Arquitectura

```text
frontend/             Aplicacion React + Vite
backend/
  prisma/             Schema Prisma y seed inicial
  src/
    config/           Variables de entorno
    controllers/      Capa HTTP
    services/         Reglas de negocio
    repositories/     Acceso a datos
    middlewares/      Auth, validacion y errores
    routes/           Endpoints REST
database/             SQL auxiliar
```

## Requisitos previos

- Node.js 20 o superior.
- MySQL Server y MySQL Workbench.
- Git.
- Cuenta Culqi para llaves reales, si se desea cobrar en produccion.

## Configuracion de MySQL

En MySQL Workbench ejecuta:

```sql
CREATE DATABASE agencia_tours;
```

La cadena por defecto usa el usuario `root`, password `luis` y base `agencia_tours`:

```env
DATABASE_URL="mysql://root:luis@localhost:3306/agencia_tours"
```

## Instalacion

```bash
npm run install:all
```

Copia variables de entorno:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

## Prisma

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

El seed crea el administrador:

- Email: `admin@jhontours.com`
- Password: `Admin12345`

Tambien crea los tours iniciales: Machu Picchu, Disney Orlando, Oxapampa, Ica y Huacachina, y Egipto.

## Ejecucion local

Terminal backend:

```bash
npm run dev --prefix backend
```

Terminal frontend:

```bash
npm run dev --prefix frontend
```

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api`
- Healthcheck: `http://localhost:4000/api/health`

## Endpoints principales

- `GET /api/tours`
- `GET /api/tours/:id`
- `POST /api/tours`
- `PUT /api/tours/:id`
- `DELETE /api/tours/:id`
- `POST /api/reservations`
- `GET /api/reservations`
- `GET /api/reservations/:id`
- `POST /api/payments/culqi`
- `POST /api/payments/yape`
- `POST /api/webhooks/culqi`
- `POST /api/auth/login`
- `POST /api/contact`

## Integracion con Culqi y Yape

- La llave publica va en `frontend/.env` como `VITE_CULQI_PUBLIC_KEY`.
- La llave privada va solo en `backend/.env` como `CULQI_PRIVATE_KEY`.
- El backend nunca confia en el monto enviado por el frontend: calcula el total usando la reserva y el precio del tour guardado en MySQL.
- Si no configuras una llave privada real, el backend usa modo demo para facilitar la presentacion academica.
- No se guardan datos sensibles de tarjetas.
- La pantalla `/pago/:id` ya tiene un slot visual `culqi-checkout-slot` para montar Culqi Checkout cuando se usen llaves reales.
- La misma pantalla genera un QR aleatorio local para simular pagos Yape/Culqi en la presentacion.

## WhatsApp

El numero de contacto principal esta configurado como `+51 945 342 536`.

```env
VITE_WHATSAPP_NUMBER=51945342536
```

La web genera enlaces `wa.me` con mensajes prellenados para:

- Cotizacion general.
- Cotizacion de un tour especifico.
- Confirmacion o envio de comprobante de una reserva.

## Panel admin

Ruta:

```bash
http://localhost:5173/admin
```

Credenciales seed:

- Email: `admin@jhontours.com`
- Password: `Admin12345`

Funciones disponibles:

- Crear tours.
- Editar tours.
- Marcar tours como destacados.
- Activar o inactivar tours.
- Desactivar tours desde el listado.
- Ver reservas y pagos.

## Despliegue sugerido

- Frontend: Vercel.
- Backend: Railway o Render.
- Base de datos: Railway MySQL, PlanetScale compatible MySQL o un MySQL administrado.

### Despliegue rapido en Vercel

1. Sube los cambios a GitHub:

```bash
git push origin main
```

2. En Vercel, crea un proyecto nuevo e importa este repositorio.
3. Configura el proyecto asi:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. En `Environment Variables`, agrega:

```env
VITE_WHATSAPP_NUMBER=51945342536
VITE_CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxx
```

Si vas a conectar un backend real, agrega tambien:

```env
VITE_API_URL=https://tu-backend-en-render-o-railway.com/api
```

Si no tienes backend desplegado, la web igual funciona con datos demo porque el frontend tiene fallback para tours, testimonios y panel admin.

5. Click en `Deploy`.
6. Cuando termine, Vercel te dara una URL tipo:

```text
https://tu-proyecto.vercel.app
```

Variables importantes para el backend en produccion:

```env
DATABASE_URL=
FRONTEND_URL=
JWT_SECRET=
CULQI_PRIVATE_KEY=
ADMIN_EMAIL=admin@jhontours.com
ADMIN_PASSWORD=Admin12345
```

## Capturas sugeridas para evidencias

- Inicio con hero y barra de busqueda.
- Catalogo con filtros.
- Detalle de tour.
- Formulario de reserva.
- Pantalla de pago Culqi/Yape.
- Confirmacion de reserva pagada.
- Panel admin con reservas y pagos.

## Git

Autor configurado localmente:

```bash
git config user.name "Luis Angel Dionicio Bartolo"
```
