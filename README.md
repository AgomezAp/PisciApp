# PisciApp - Sistema de Gestión Acuícola

## 📋 Descripción
PisciApp es una aplicación web completa para la gestión y monitoreo de ciclos de producción acuícola. Permite administrar tanques, ciclos de crianza, inventarios, ventas y realizar seguimiento económico de la producción.

## 🛠️ Tecnologías

### Frontend
- **Framework:** Angular 18+ (Standalone Components)
- **Lenguaje:** TypeScript
- **UI:** CSS personalizado con diseño responsive
- **Gráficos:** Chart.js (ng2-charts)
- **Formularios:** FormsModule con two-way binding

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **ORM:** Sequelize
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)

## 📁 Estructura del Proyecto

```
PisciApp/
├── Backend/
│   └── src/
│       ├── controllers/      # Lógica de negocio
│       ├── models/           # Modelos de Sequelize
│       ├── routes/           # Rutas de la API
│       ├── middlewares/      # Verificación de tokens, uploads
│       ├── services/         # Servicios externos (email, cron)
│       ├── database/         # Configuración de conexión
│       └── utils/            # Utilidades compartidas
│
└── PisciApp/
    └── src/
        └── app/
            ├── core/
            │   ├── guards/       # Protección de rutas
            │   ├── interceptors/ # Interceptores HTTP
            │   └── services/     # Servicios de negocio
            ├── features/         # Módulos funcionales
            │   ├── auth/         # Autenticación
            │   ├── ciclos/       # Gestión de ciclos
            │   ├── empresa/      # Vista unificada
            │   ├── tanque/       # Gestión de tanques
            │   ├── inventario/   # Control de inventario
            │   └── inicio-perfil/ # Dashboard
            └── shared/           # Componentes compartidos
```

## 🚀 Funcionalidades Principales

### 1. Gestión de Ciclos
- Crear y cerrar ciclos de producción
- Registro de alimentación (alimentos y químicos)
- Control de bajas por tanque
- Movimientos de peces entre tanques
- Seguimiento de costos totales

### 2. Gestión de Tanques
- Creación de tanques (rectangulares o redondos)
- Cálculo automático de volumen
- Visualización de disponibilidad
- Contador de peces por tanque
- Tipos de tanques especializados

### 3. Gestión de Inventario
- Control de stock de alimentos y químicos
- Descuento automático al usar productos
- Seguimiento de costos por kilo
- Alertas de stock bajo

### 4. Gestión de Ventas
- Registro de ventas por ciclo
- Gestión de clientes/compradores
- Cálculo de toneladas vendidas
- Histórico de transacciones

### 5. Dashboard Económico
- **Gastos Totales:** Suma de costos de ciclos cerrados
- **Ingresos Totales:** Suma de precios de ventas
- **Utilidad Aproximada:** Cálculo automático (Ingresos - Gastos)
- **Capacidad Máxima:** Promedio de toneladas vendidas
- Gráficos de rendimiento

### 6. Vista Empresa (Unificada)
- Tabs para navegar entre ciclos, tanques y ventas
- Acciones rápidas desde tarjetas de ciclo:
  - 💲 **Vender:** Abre modal de venta preseleccionado
  - 🔄 **Movimiento:** Transfiere peces entre tanques
- Filtros y búsqueda avanzada
- Diseño responsive optimizado para móviles

## 🔐 Autenticación y Seguridad
- Login con email y contraseña
- Tokens JWT con refresh automático
- Guards de Angular para protección de rutas
- Interceptores para manejo de errores
- Middleware de verificación en backend

## 📊 Modelos de Base de Datos

### Principales Entidades
- **Usuarios:** Información de autenticación y perfil
- **Ciclos:** Registros de producción con fechas y costos
- **Tanques:** Especificaciones físicas y disponibilidad
- **CicloTanque:** Relación many-to-many entre ciclos y tanques
- **Alimentos/Químicos:** Insumos utilizados por ciclo
- **Bajas:** Registro de mortalidad por causa
- **MovimientoTanque:** Historial de transferencias
- **Ventas:** Transacciones comerciales
- **Inventario:** Stock actual de productos

## 🎨 Características de UI/UX

### Responsive Design
- **Desktop:** Tarjetas grandes, espaciado amplio
- **Tablet (≤768px):** Tamaños medianos, padding reducido
- **Mobile (≤480px):** Diseño compacto, tabs horizontales

### Estados Visuales
- **Ciclos:** Badge verde (Activo) / gris (Cerrado)
- **Tanques:** Badge azul (Disponible) / naranja (Ocupado)
- **Botones:** Deshabilitados para ciclos cerrados
- **Modales:** Backdrop oscuro con animaciones

### Información Dinámica
- Tarjetas de ciclo muestran datos diferentes según estado:
  - **Activo:** Especie, Peces, Fecha inicio, Costos
  - **Cerrado:** Especie, Fecha inicio, Fecha fin, Costos
- Tanques ocupados muestran cantidad de peces actual

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js (v18+)
- PostgreSQL (v14+)
- npm o yarn

### Backend
```bash
cd Backend
npm install
# Configurar variables de entorno en .env
npm run dev
```

### Frontend
```bash
cd PisciApp
npm install
ng serve
```

### Variables de Entorno (Backend)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pisciapp
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_secret_key
PORT=3000
```

### Variables de Entorno (Frontend)
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/'
};
```

## 📝 API Endpoints Principales

### Ciclos
- `POST /api/ciclos/crear` - Crear nuevo ciclo
- `GET /api/ciclos/obtener/:usuario_id` - Obtener ciclos de usuario
- `GET /api/ciclos/tanques/:ciclo_id` - Obtener tanques de ciclo
- `POST /api/ciclos/cerrar` - Cerrar ciclo
- `POST /api/ciclos/bajas/:ciclo_id` - Registrar bajas
- `POST /api/ciclos/alimento/:ciclo_id` - Agregar alimento
- `POST /api/ciclos/quimico/:ciclo_id` - Agregar químico
- `POST /api/ciclos/cambiar-tanque/:ciclo_id` - Mover peces

### Tanques
- `POST /api/tanques/crear` - Crear tanque
- `GET /api/tanques/obtener/:usuario_id` - Obtener tanques
- `PUT /api/tanques/actualizar/:id` - Actualizar tanque
- `DELETE /api/tanques/eliminar/:id` - Eliminar tanque

### Ventas
- `POST /api/ventas/crear` - Registrar venta
- `GET /api/ventas/obtener` - Obtener ventas de usuario

### Inventario
- `POST /api/inventario/crear` - Agregar producto
- `GET /api/inventario/obtener/:usuario_id` - Obtener inventario

## 🐛 Solución de Problemas Comunes

### Error: No se pueden mover peces
- **Causa:** No hay tanques disponibles
- **Solución:** Crear un nuevo tanque o verificar cual es el que deberia estar vacio.

### Error: Stock insuficiente
- **Causa:** Intentar usar más producto del disponible en inventario
- **Solución:** Verificar peso_total del producto antes de agregar

### Error: Ciclo cerrado
- **Causa:** Intentar modificar un ciclo con fecha_fin definida
- **Solución:** Los botones se deshabilitan automáticamente

### Tanques no muestran peces
- **Causa:** El servicio obtenerCicloTanques no se ejecutó
- **Solución:** Se carga automáticamente después de cargar tanques


## 📄 Licencia
Proyecto privado - Todos los derechos reservados

## 📞 Contacto
Para consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Última actualización:** Diciembre 2025 
**Versión:** 1.0.0  
**Estado:** En desarrollo activo 🚧
