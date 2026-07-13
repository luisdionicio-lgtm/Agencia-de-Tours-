# Arquitectura del frontend

El código se organiza por responsabilidad para evitar dependencias circulares y
mantener estable el punto de entrada:

- `core/`: infraestructura propia de React, como el enrutador.
- `features/`: funcionalidades de negocio. `tours/` contiene la experiencia
  pública, reservas, pagos y administración de la agencia.
- `infrastructure/`: comunicación con servicios externos y con la API.
- `shared/`: contratos y tipos que pueden utilizar varias funcionalidades.
- `App.tsx`: composición mínima de la aplicación.
- `ClientShell.tsx`: proveedores globales ejecutados en el cliente.

Las dependencias deben apuntar desde `features` hacia `core`, `infrastructure` y
`shared`; estas carpetas no deben importar implementaciones desde `features`.
