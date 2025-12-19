# PisciApp Backend

## 📋 Descripción

Backend de PisciApp, una herramienta integral para la gestión de piscicultura que permite a los acuicultores administrar estanques, registrar alimentación, mortalidad, costos, ventas y generar reportes detallados. El sistema facilita el seguimiento completo del ciclo productivo mejorando la precisión en las predicciones de producción.

## 🚀 Tecnologías Utilizadas

- **Node.js** con **TypeScript**
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación y autorización
- **Argon2** / **Bcrypt** - Hash de contraseñas
- **Nodemailer** - Envío de correos electrónicos
- **Speakeasy** - Autenticación de dos factores (2FA)
- **Google OAuth 2.0** - Login con Google
- **Multer** - Carga de archivos
- **Node-cron** - Tareas programadas
- **Helmet** - Seguridad HTTP
- **CORS** - Control de acceso entre orígenes

## 📁 Estructura del Proyecto

```
Backend/
├── src/
│   ├── index.ts                 # Punto de entrada de la aplicación
│   ├── models/
│   │   ├── server.ts           # Configuración del servidor Express
│   │   ├── index.ts            # Definición de relaciones entre modelos
│   │   ├── usuario.ts          # Modelo de Usuario
│   │   ├── tanque.ts           # Modelo de Tanque y Mediciones
│   │   ├── ciclo.ts            # Modelos de Ciclo, Alimento, Químico, Bajas
│   │   ├── inventario.ts       # Modelo de Inventario
│   │   ├── producto.ts         # Modelo de Producto
│   │   ├── venta.ts            # Modelos de Venta y Comprador
│   │   ├── empresa.ts          # Modelo de Empresa
│   │   ├── session.ts          # Modelo de Sesión
│   │   └── ...
│   ├── controllers/
│   │   ├── usuario.ts          # Lógica de autenticación y usuarios
│   │   ├── ciclo.ts            # Gestión de ciclos productivos
│   │   ├── tanque.ts           # Gestión de tanques
│   │   ├── inventario.ts       # Gestión de inventario
│   │   ├── producto.ts         # Gestión de productos
│   │   ├── venta.ts            # Gestión de ventas
│   │   └── empresa.ts          # Gestión de información de empresa
│   ├── routes/
│   │   ├── auth.ts             # Rutas de autenticación
│   │   ├── usuario.ts          # Rutas de usuario
│   │   ├── ciclo.ts            # Rutas de ciclos
│   │   ├── tanque.ts           # Rutas de tanques
│   │   ├── inventario.ts       # Rutas de inventario
│   │   ├── producto.ts         # Rutas de productos
│   │   ├── ventas.ts           # Rutas de ventas
│   │   └── empresa.ts          # Rutas de empresa
│   ├── middlewares/
│   │   ├── verifyToken.ts      # Verificación de JWT
│   │   ├── checkTrial.ts       # Validación de periodo de prueba
│   │   └── upload.ts           # Configuración de Multer
│   ├── services/
│   │   ├── cronJobs.ts         # Tareas programadas (recordatorios, cobros)
│   │   ├── emailService.ts     # Servicio de envío de correos
│   │   └── googleAuth.ts       # Autenticación con Google
│   ├── templates/
│   │   └── emailTemplates.ts   # Plantillas HTML para correos
│   ├── utils/
│   │   └── token.ts            # Utilidades para manejo de tokens
│   └── database/
│       └── connection.ts       # Configuración de conexión a PostgreSQL
├── uploads/
│   └── profile_pics/           # Almacenamiento de fotos de perfil
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Funcionalidades Principales

### 1. **Autenticación y Seguridad**
- ✅ Registro de usuarios con verificación por correo electrónico
- ✅ Login tradicional con JWT (Access Token + Refresh Token)
- ✅ Login con Google OAuth 2.0
- ✅ Autenticación de dos factores (2FA) con códigos QR
- ✅ Recuperación de contraseña
- ✅ Gestión de sesiones con revocación
- ✅ Rate limiting en endpoints críticos
- ✅ Middleware de verificación de tokens

### 2. **Gestión de Ciclos Productivos**
- ✅ Crear ciclos de producción con tanques asignados
- ✅ Registro de alimentación (tipo, cantidad, costos)
- ✅ Registro de químicos utilizados
- ✅ Control de bajas/mortalidad por tanque
- ✅ Movimientos de peces entre tanques
- ✅ Cierre de ciclos con validaciones
- ✅ Cálculo automático de peces actuales

### 3. **Gestión de Tanques**
- ✅ Crear tanques (rectangular/redondo) con dimensiones
- ✅ Cálculo automático de volumen
- ✅ Control de disponibilidad
- ✅ Mediciones de calidad del agua:
  - pH, Oxígeno disuelto, Temperatura
  - Nitritos, Amoniaco, Nitratos, Salinidad
- ✅ Historial de mediciones

### 4. **Inventario**
- ✅ Gestión de materiales: Alimento, Químico, Máquina, Herramienta
- ✅ Control de stock (cantidad, unidad de medida, peso)
- ✅ Seguimiento de costos (insumo + transporte)
- ✅ Fechas de caducidad
- ✅ Información de proveedores y lotes
- ✅ Actualización y eliminación de items

### 5. **Ventas**
- ✅ Registro de ventas de producción
- ✅ Gestión de compradores
- ✅ Seguimiento de ingresos
- ✅ Relación con ciclos productivos

### 6. **Empresa**
- ✅ Perfil de la empresa
- ✅ Información comercial y de contacto

### 7. **Sistema de Notificaciones**
- ✅ Correos de verificación de cuenta
- ✅ Recordatorios de periodo de prueba
- ✅ Alertas de periodo de gracia
- ✅ Confirmación de recuperación de contraseña
- ✅ Plantillas HTML personalizadas

### 8. **Tareas Programadas (Cron Jobs)**
- ✅ Revisión diaria de usuarios en periodo de gracia
- ✅ Avisos de finalización de periodo de prueba (3 días antes)
- ✅ Limpieza de sesiones expiradas
- ✅ Envío automático de recordatorios

## 🔐 Seguridad Implementada

1. **Autenticación JWT**
   - Access tokens de corta duración (15 min)
   - Refresh tokens almacenados con httpOnly cookies
   - Validación de sesiones en base de datos

2. **Hash de Contraseñas**
   - Argon2 para nuevos usuarios
   - Bcrypt para compatibilidad

3. **Protección de Headers**
   - Helmet.js para CSP y seguridad HTTP
   - CORS configurado específicamente

4. **Rate Limiting**
   - Limitación de intentos de login
   - Protección contra ataques de fuerza bruta

5. **Validaciones**
   - Contraseñas fuertes (8+ caracteres, mayúsculas, números, especiales)
   - Validación de datos en cada endpoint
   - Sanitización de entradas

## 🗄️ Modelos de Base de Datos

### Principales Tablas

- **usuarios**: Datos de usuarios, configuraciones, periodo de prueba
- **sesiones**: Gestión de sesiones activas
- **empresas**: Información de la empresa del usuario
- **tanques**: Estanques con dimensiones y estado
- **mediciones**: Calidad del agua por tanque
- **ciclos**: Ciclos productivos
- **ciclo_tanques**: Relación muchos a muchos ciclo-tanque
- **alimentos**: Registro de alimentación
- **quimicos**: Registro de químicos utilizados
- **bajas**: Mortalidad por tanque y ciclo
- **movimientos_tanque**: Transferencias entre tanques
- **inventarios**: Stock de materiales
- **ventas**: Registro de ventas
- **compradores**: Clientes que compran producción

### Relaciones Principales

```
Usuario (1) ─── (N) Ciclos
Usuario (1) ─── (N) Tanques
Usuario (1) ─── (N) Inventarios
Usuario (1) ─── (1) Empresa
Ciclo (N) ─── (M) Tanques (through CicloTanque)
Ciclo (1) ─── (N) Alimentos
Ciclo (1) ─── (N) Químicos
Ciclo (1) ─── (N) Bajas
Tanque (1) ─── (N) Mediciones
```

## ⚙️ Instalación y Configuración

### Requisitos Previos
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

### Paso 1: Instalar Dependencias
```bash
npm install
```

### Paso 2: Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=3010

# Base de datos PostgreSQL
DATABASE_URL=postgres://usuario:password@host:port/database?ssl=true

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_REFRESH_SECRET=tu_secreto_refresh_aqui

# Email (Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# Frontend URL
FRONTEND_URL=http://localhost:4200

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### Paso 3: Compilar TypeScript
```bash
npm run typescript
```

### Paso 4: Ejecutar el Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3010`

## 📡 Endpoints Principales

### Autenticación (`/auth`)
```
POST   /auth/register        - Registrar usuario
POST   /auth/verify          - Verificar código de email
POST   /auth/login           - Login tradicional
POST   /auth/google          - Login con Google
POST   /auth/refresh         - Renovar access token
POST   /auth/logout          - Cerrar sesión
```

### Usuarios (`/usuarios`)
```
GET    /usuarios/perfil      - Obtener perfil
PUT    /usuarios/perfil      - Actualizar perfil
POST   /usuarios/2fa/generar - Generar QR de 2FA
POST   /usuarios/2fa/verificar - Verificar código 2FA
```

### Ciclos (`/ciclos`)
```
POST   /ciclos/crear         - Crear nuevo ciclo
GET    /ciclos/obtener/:id   - Obtener ciclos por usuario
POST   /ciclos/cerrar        - Cerrar ciclo
POST   /ciclos/bajas/:id     - Registrar bajas
POST   /ciclos/alimento/:id  - Registrar alimentación
POST   /ciclos/quimico/:id   - Registrar químico
POST   /ciclos/cambiar-tanque/:id - Mover peces entre tanques
```

### Tanques (`/tanque`)
```
POST   /tanque/crear         - Crear tanque
GET    /tanque/obtener/:id   - Obtener tanques por usuario
PUT    /tanque/editar/:id    - Editar tanque
DELETE /tanque/eliminar/:id  - Eliminar tanque
POST   /tanque/mediciones/:id - Crear medición
GET    /tanque/obtenermed/:id - Obtener mediciones
```

### Inventario (`/inventario`)
```
POST   /inventario/agregar   - Agregar item
GET    /inventario/obtener   - Obtener inventario
PUT    /inventario/actualizar/:id - Actualizar item
DELETE /inventario/eliminar/:id - Eliminar item
```

### Ventas (`/venta`)
```
POST   /venta/nueva          - Registrar venta
GET    /venta/obtener        - Obtener ventas
GET    /venta/compradores    - Obtener compradores
```

### Empresa (`/empresa`)
```
POST   /empresa/crear        - Crear información de empresa
GET    /empresa/obtener      - Obtener información de empresa
PUT    /empresa/actualizar   - Actualizar información de empresa
```

## 🔄 Flujos Principales

### Flujo de Registro
1. Usuario se registra con datos básicos
2. Sistema genera código de verificación de 6 dígitos
3. Se envía correo con código
4. Usuario verifica código
5. Cuenta activada → periodo de prueba de 30 días

### Flujo de Login
1. Usuario ingresa credenciales
2. Sistema valida y verifica periodo de prueba
3. Si tiene 2FA habilitado → solicita código
4. Genera Access Token (15 min) y Refresh Token (7 días)
5. Crea sesión en BD

### Flujo de Ciclo Productivo
1. Crear ciclo con tanque asignado
2. Tanque marca como "no disponible"
3. Registrar alimentación diaria
4. Registrar químicos según necesidad
5. Registrar bajas/mortalidad
6. Opcionalmente mover peces entre tanques
7. Cerrar ciclo cuando `numero_actual = 0`
8. Tanque vuelve a estar disponible

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
npm run dev        # Ejecutar en modo desarrollo con nodemon
npm run typescript # Compilar TypeScript en modo watch
npm start          # Ejecutar servidor (requiere compilación previa)
npm test          # Ejecutar tests (pendiente implementación)
```

### Compilación
TypeScript se compila a la carpeta `dist/`

## 📊 Sincronización de Base de Datos

El servidor sincroniza automáticamente los modelos con la base de datos usando `sequelize.sync({ alter: true })` al iniciar, permitiendo actualizaciones sin perder datos.

## 🔔 Notificaciones por Correo

Se utilizan plantillas HTML personalizadas para:
- ✉️ Verificación de cuenta
- ✉️ Recuperación de contraseña
- ✉️ Finalización de periodo de prueba
- ✉️ Periodo de gracia de pago

## 🚦 Estado del Proyecto

✅ **Funcional en Desarrollo**
- Backend completo con todas las funcionalidades principales
- Autenticación robusta con JWT y 2FA
- Gestión completa de ciclos productivos
- Sistema de inventario funcional
- Notificaciones automáticas

## 📝 Notas Importantes

- Los archivos subidos (fotos de perfil) se almacenan en `/uploads/profile_pics/`
- Las sesiones se validan en cada petición protegida
- Los tokens expirados activan el flujo de refresh automáticamente
- El sistema maneja reactivación de cuentas eliminadas

## 👨‍💻 Autor

PisciApp Backend - Sistema de Gestión para Piscicultura

---

**Última actualización**: Diciembre 2025
