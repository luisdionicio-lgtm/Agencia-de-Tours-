# John Tours Perú - Agencia de Viajes y Turismo

Plataforma web fullstack para presentar tours nacionales e internacionales, promociones escolares y viajes grupales. Incluye catálogo, detalle de cada experiencia, reserva desde S/ 200 por Yape, código único de operación, envío del comprobante por WhatsApp, demostración comercial y panel administrativo.

## Estado actual

### Sitio público

- Identidad visual azul y turquesa basada en la marca de John Tours Perú.
- Logo oficial animado con efecto 3D.
- Inicio adaptable a celulares, tablets y computadoras.
- Carruseles de destinos y tours destacados.
- Catálogo con filtros para tours nacionales e internacionales.
- Detalle del tour con precio, duración, disponibilidad, itinerario, inclusiones y exclusiones.
- Secciones de historia, confianza, preguntas frecuentes y testimonios.
- Área preparada para promociones escolares, delegaciones y viajes realizados.
- Enlaces oficiales a TikTok e Instagram.
- Contacto directo mediante WhatsApp.

### Reservas

- Formulario de datos del pasajero y fecha del viaje.
- Separación fija de S/ 200.
- QR con instrucciones de pago y código único por reserva.
- Envío del comprobante a WhatsApp para validación manual.
- Modo demostración que simula la aprobación sin realizar un cobro.
- PDF de servicios adicionales disponible solamente después de confirmar la reserva.
- El PDF muestra servicios turísticos generales y no revela itinerarios o propuestas exclusivas.

### Administración y arquitectura

- Frontend: Next.js, React, TypeScript y Tailwind CSS.
- Backend: Node.js, Express, TypeScript, Prisma y MySQL.
- Panel administrativo para tours, reservas, pagos y configuración empresarial.
- Fallback local para demostrar tours y reservas cuando el backend no está disponible.
- Validación de formularios con Zod y React Hook Form.
- Estructura preparada para desplegar frontend y API por separado.

## Demostración del avance

1. Abrir el inicio y mostrar la identidad, logo animado y carruseles.
2. Ingresar al catálogo y seleccionar un tour.
3. Completar el formulario de reserva.
4. Mostrar el QR, monto de S/ 200 y código único.
5. Presionar `Demostración para presentación`.
6. Enseñar la confirmación de reserva sin transacción bancaria real.
7. Descargar el PDF de servicios adicionales desde la confirmación.
8. Revisar las secciones de promociones, historia, TikTok e Instagram.

El modo demostración informa expresamente que no genera cargos ni operaciones bancarias.

## Pendientes antes de producción

### Contenido audiovisual

- Reemplazar las fotografías referenciales por imágenes propias con autorización.
- Incorporar fotografías reales de promociones escolares y delegaciones atendidas.
- Recibir videos verticales y horizontales optimizados para web.
- Añadir un carrusel mixto de fotografías y videos reales.
- Preparar miniaturas, textos alternativos y versiones comprimidas para carga rápida.
- Confirmar qué materiales pueden publicarse por contar con autorización de imagen.

### Yape y transacciones

- Confirmar el número Yape empresarial definitivo y el nombre exacto del titular.
- Sustituir el QR informativo por el QR empresarial oficial cuando sea entregado.
- Definir quién validará los comprobantes y en cuánto tiempo.
- Crear el registro backend de comprobantes, estado de validación y auditoría.
- Evitar confirmaciones duplicadas y códigos de reserva reutilizados.
- Definir políticas de separación, saldo, vencimiento, cancelación y devolución.
- Integrar notificaciones automáticas al aprobar o rechazar un comprobante.
- Realizar pruebas de seguridad y transacciones antes de habilitar pagos reales.

### Empresa y operación

- Configurar correos corporativos cuando estén disponibles.
- Completar razón social, RUC, Libro de Reclamaciones y políticas legales.
- Conectar dominio, alojamiento de producción, base de datos y copias de seguridad.
- Cambiar las credenciales administrativas de demostración.
- Configurar SMTP para confirmaciones por correo.
- Añadir analítica, SEO, monitoreo y registro de errores.

## Instalación

```bash
npm run install:all
```

Configurar las variables de entorno del frontend y backend usando sus archivos `.env.example`.

Base de datos:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Ejecución local:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Compilación del frontend:

```bash
npm run build --prefix frontend
```

## Datos que debe entregar John Tours Perú

- Número y titular oficial de Yape.
- QR empresarial oficial.
- Correos corporativos.
- Fotografías y videos autorizados.
- Historia empresarial definitiva y datos del fundador.
- Tarifas, cupos, fechas e inclusiones reales de cada tour.
- Políticas comerciales y legales aprobadas.

## Seguridad

Nunca se deben guardar claves de Yape, códigos SMS, contraseñas bancarias ni datos sensibles del cliente. La confirmación real debe ocurrir únicamente después de validar el comprobante, el monto, el titular y el código único de la reserva.
