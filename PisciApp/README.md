# PisciApp Frontend

## 📋 Descripción

Frontend de PisciApp, aplicación web desarrollada en Angular para la gestión integral de piscicultura. Proporciona una interfaz moderna e intuitiva que permite a los acuicultores administrar ciclos productivos, tanques, inventario, ventas y visualizar datos en tiempo real con gráficas interactivas.

## 🚀 Tecnologías Utilizadas

- **Angular 19.2** - Framework principal
- **TypeScript 5.7** - Lenguaje de programación
- **Angular Material 19.2** - Biblioteca de componentes UI
- **Chart.js 4.5** + **ng2-charts** - Visualización de datos
- **RxJS 7.8** - Programación reactiva
- **SweetAlert2** - Alertas y notificaciones
- **JWT-Decode** - Decodificación de tokens
- **Angular Router** - Navegación SPA
- **Angular Forms** - Formularios reactivos
- **HttpClient** - Comunicación con API REST

## 📁 Estructura del Proyecto

```
PisciApp/
├── src/
│   ├── main.ts                      # Punto de entrada de la aplicación
│   ├── index.html                   # HTML principal
│   ├── styles.css                   # Estilos globales
│   ├── app/
│   │   ├── app.component.ts         # Componente raíz
│   │   ├── app.config.ts            # Configuración de la app
│   │   ├── app.routes.ts            # Definición de rutas
│   │   ├── core/                    # Funcionalidad central
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts    # Guard de autenticación
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts  # Interceptor HTTP para tokens
│   │   │   └── services/
│   │   │       ├── auth.service.ts       # Servicio de autenticación
│   │   │       ├── ciclo.service.ts      # Servicio de ciclos
│   │   │       ├── tanque.service.ts     # Servicio de tanques
│   │   │       ├── inventario.service.ts # Servicio de inventario
│   │   │       ├── venta.service.ts      # Servicio de ventas
│   │   │       ├── empresa.service.ts    # Servicio de empresa
│   │   │       ├── error.service.ts      # Manejo de errores
│   │   │       ├── notification.service.ts # Notificaciones
│   │   │       ├── preferencias.service.ts # Preferencias de usuario
│   │   │       └── twofa.service.ts      # Autenticación 2FA
│   │   ├── features/                # Módulos funcionales
│   │   │   ├── auth/
│   │   │   │   └── pages/
│   │   │   │       ├── login/            # Página de login
│   │   │   │       ├── register/         # Página de registro
│   │   │   │       ├── verify-email/     # Verificación de email
│   │   │   │       ├── contrasena-olvidada/  # Recuperación de contraseña
│   │   │   │       └── registro-empresa/ # Registro de empresa
│   │   │   ├── ciclos/
│   │   │   │   ├── ciclos.component.ts   # Gestión de ciclos
│   │   │   │   ├── ciclos.component.html
│   │   │   │   └── ciclos.component.css
│   │   │   ├── tanques/
│   │   │   │   └── tanques.component.ts  # Gestión de tanques
│   │   │   ├── inventario/
│   │   │   │   └── inventario.component.ts # Gestión de inventario
│   │   │   ├── diario/
│   │   │   │   └── diario.component.ts   # Registro diario
│   │   │   ├── empresa/
│   │   │   │   └── empresa.component.ts  # Información de empresa
│   │   │   ├── configuracion/
│   │   │   │   └── pages/
│   │   │   │       └── configuracion/    # Configuración de usuario
│   │   │   ├── inicio-perfil/
│   │   │   │   └── inicio-perfil.component.ts # Dashboard principal
│   │   │   └── inicio/
│   │   │       └── inicio.component.ts   # Página de bienvenida
│   │   └── shared/                  # Componentes compartidos
│   │       ├── components/
│   │       │   └── navbar/          # Barra de navegación
│   │       └── layout/
│   │           └── main-layout/     # Layout principal
│   ├── assets/                      # Recursos estáticos
│   ├── environments/                # Configuración de entornos
│   │   ├── environment.ts           # Desarrollo
│   │   └── environment.prod.ts      # Producción
│   └── styles/
│       └── custom-theme.scss        # Tema personalizado Material
├── angular.json                     # Configuración de Angular CLI
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Funcionalidades Principales

### 1. **Autenticación y Seguridad**
- ✅ Login con email/contraseña
- ✅ Login con Google OAuth 2.0
- ✅ Registro de usuarios con verificación de email
- ✅ Recuperación de contraseña
- ✅ Autenticación de dos factores (2FA)
- ✅ Gestión de tokens JWT (Access + Refresh)
- ✅ Auto-refresh de tokens expirados
- ✅ Recordar sesión (localStorage vs sessionStorage)
- ✅ Protección de rutas con AuthGuard

### 2. **Dashboard Principal**
- ✅ Vista general de la operación
- ✅ Resumen de ciclos activos
- ✅ Estadísticas de producción
- ✅ Acceso rápido a funcionalidades

### 3. **Gestión de Ciclos Productivos**
- ✅ Crear nuevos ciclos de producción
- ✅ Asignar tanques a ciclos
- ✅ Registrar alimentación diaria
  - Cantidad, tipo, costo
  - Historial completo
- ✅ Registrar químicos utilizados
  - Control de dosificación
  - Seguimiento de costos
- ✅ Control de bajas/mortalidad
  - Por tanque
  - Estadísticas acumuladas
- ✅ Movimientos entre tanques
  - Redistribución de peces
  - Trazabilidad completa
- ✅ Cierre de ciclos
  - Validaciones automáticas
  - Confirmación con frase

### 4. **Visualización de Datos**
- ✅ Gráficas de alimentación (Chart.js)
  - Líneas temporales
  - Comparativas por tipo
- ✅ Gráficas de químicos
  - Seguimiento de uso
- ✅ Gráficas de bajas/mortalidad
  - Tendencias temporales
- ✅ Distribución de peces por tanque (Gráfico de pastel)
- ✅ Mediciones de calidad del agua
  - pH, Oxígeno, Temperatura
  - Nitritos, Amoniaco, Nitratos
- ✅ Gráficas de movimientos entre tanques

### 5. **Gestión de Tanques**
- ✅ Crear tanques (rectangulares/redondos)
- ✅ Especificar dimensiones y volumen
- ✅ Editar y eliminar tanques
- ✅ Estado de disponibilidad
- ✅ Registro de mediciones de calidad del agua
- ✅ Historial de mediciones
- ✅ Alertas de parámetros fuera de rango

### 6. **Inventario**
- ✅ Gestión de materiales:
  - Alimento
  - Químicos
  - Máquinas
  - Herramientas
- ✅ Control de stock y cantidades
- ✅ Fechas de caducidad
- ✅ Costos (insumo + transporte)
- ✅ Información de proveedores
- ✅ Actualización de inventario
- ✅ Alertas de stock bajo

### 7. **Ventas**
- ✅ Registrar ventas de producción
- ✅ Gestión de compradores
- ✅ Seguimiento de ingresos
- ✅ Histórico de transacciones

### 8. **Empresa**
- ✅ Información de la empresa
- ✅ Datos de contacto
- ✅ Configuración comercial

### 9. **Configuración de Usuario**
- ✅ Actualizar perfil
- ✅ Cambiar foto de perfil
- ✅ Configurar 2FA
- ✅ Preferencias de notificaciones
- ✅ Tema de la aplicación
- ✅ Idioma (preparado para i18n)

### 10. **Diario de Operaciones**
- ✅ Registro diario de actividades
- ✅ Bitácora de eventos
- ✅ Seguimiento temporal

## 🔒 Seguridad

### AuthGuard
Protege rutas que requieren autenticación:
```typescript
canActivate(): boolean {
  if (this.authService.isLoggedIn()) {
    return true;
  } else {
    this.router.navigate(['/login']);
    return false;
  }
}
```

### AuthInterceptor
- ✅ Añade automáticamente el token JWT a las peticiones
- ✅ Maneja errores 401 (no autorizado)
- ✅ Refresca automáticamente tokens expirados
- ✅ Evita bucles de refresh
- ✅ Excluye rutas públicas (login, register, verify)

### Manejo de Tokens
- Access Token: 15 minutos de validez
- Refresh Token: 7 días de validez (httpOnly cookie)
- Almacenamiento según preferencia: localStorage (recordar) o sessionStorage

## 🎨 Interfaz de Usuario

### Angular Material
Componentes utilizados:
- Material Toolbar (navegación)
- Material Cards (contenedores)
- Material Forms (inputs, selects)
- Material Buttons
- Material Dialogs (modales)
- Material Snackbar (notificaciones)
- Material Icons

### SweetAlert2
Alertas y confirmaciones elegantes:
- Confirmaciones de acciones críticas
- Mensajes de éxito/error
- Validaciones de usuario

### Responsive Design
- ✅ Adaptable a móviles, tablets y desktop
- ✅ Diseño mobile-first
- ✅ Grid system flexible

## 📊 Visualización con Chart.js

### Tipos de Gráficas Implementadas

1. **Gráfica de Líneas** (Alimentación y Químicos)
   - Eje X: Fechas
   - Eje Y: Cantidad
   - Múltiples datasets por tipo

2. **Gráfica de Pastel** (Distribución de Peces)
   - Peces por tanque
   - Colores diferenciados

3. **Gráfica de Barras** (Movimientos)
   - Traslados entre tanques
   - Comparativas temporales

4. **Gráficas de Calidad del Agua**
   - Parámetros múltiples en tiempo
   - Líneas de tendencia

## ⚙️ Instalación y Configuración

### Requisitos Previos
- Node.js >= 18.x
- Angular CLI 19.x
- npm o yarn

### Paso 1: Instalar Dependencias
```bash
npm install
```

### Paso 2: Configurar Entorno

Editar [src/environments/environment.ts](src/environments/environment.ts):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3010/' // URL del backend
};
```

Para producción, editar [src/environments/environment.prod.ts](src/environments/environment.prod.ts):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.pisciapp.com/' // URL del backend en producción
};
```

### Paso 3: Ejecutar la Aplicación

```bash
# Modo desarrollo (http://localhost:4200)
ng serve

# Modo desarrollo con puerto específico
ng serve --port 4300

# Modo desarrollo abierto en navegador
ng serve --open
```

### Paso 4: Compilar para Producción

```bash
# Build de producción
ng build --configuration production

# Los archivos compilados estarán en dist/
```

## 📡 Integración con Backend

### Servicios HTTP

Todos los servicios consumen la API REST del backend:

```typescript
// Ejemplo: CicloService
crearCiclo(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}ciclos/crear`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
}
```

### Manejo de Errores Centralizado

```typescript
// ErrorService
handleError(error: HttpErrorResponse) {
  if (error.status === 0) {
    console.error('Error de red:', error.error);
  } else {
    console.error(`Backend returned code ${error.status}, body was: `, error.error);
  }
  return throwError(() => new Error('Algo salió mal; por favor intenta nuevamente.'));
}
```

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Servidor de desarrollo
ng serve

# Build
ng build

# Build para producción
ng build --configuration production

# Tests unitarios
ng test

# Tests E2E
ng e2e

# Linting
ng lint

# Generar componente
ng generate component nombre-componente

# Generar servicio
ng generate service nombre-servicio
```

### Estructura de Componentes

Los componentes siguen el patrón standalone de Angular:

```typescript
@Component({
  selector: 'app-ciclos',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './ciclos.component.html',
  styleUrls: ['./ciclos.component.css']
})
export class CiclosComponent implements OnInit { }
```

## 🔄 Flujos de Usuario

### Flujo de Login
1. Usuario ingresa credenciales
2. Si es exitoso y no requiere 2FA → redirige a dashboard
3. Si requiere 2FA → solicita código
4. Verifica código → redirige a dashboard
5. Token guardado según preferencia

### Flujo de Registro
1. Usuario completa formulario
2. Sistema envía código de verificación por email
3. Usuario verifica código
4. Cuenta activada → redirige a registro de empresa (opcional)
5. Acceso a la aplicación

### Flujo de Gestión de Ciclo
1. Crear ciclo desde vista de ciclos
2. Seleccionar tanque disponible
3. Especificar número de peces y especie
4. Durante el ciclo:
   - Registrar alimentación diaria
   - Registrar químicos
   - Registrar bajas
   - Ver gráficas en tiempo real
5. Cerrar ciclo cuando termine

## 📱 Responsive y UX

- **Mobile First**: Diseño optimizado para móviles
- **Navegación Intuitiva**: Menú lateral/superior según dispositivo
- **Carga Rápida**: Lazy loading de módulos
- **Feedback Visual**: Loaders, spinners, mensajes de estado
- **Validación de Formularios**: En tiempo real con mensajes claros

## 🎯 Características Avanzadas

### Lazy Loading
Módulos cargados bajo demanda:
```typescript
{
  path: 'inventario',
  loadComponent: () => import('./features/inventario/inventario.component')
    .then((m) => m.InventarioComponent),
}
```

### Programación Reactiva (RxJS)
- Observables para datos en tiempo real
- Pipes para transformación de datos
- Manejo de estados asíncronos

### Formularios Reactivos
```typescript
this.formulario = new FormGroup({
  nombre: new FormControl('', [Validators.required]),
  cantidad: new FormControl(0, [Validators.required, Validators.min(1)])
});
```

## 🚦 Estado del Proyecto

✅ **Funcional en Desarrollo**
- Autenticación completa con 2FA
- Gestión de ciclos productivos operativa
- Visualización de datos con gráficas
- Inventario funcional
- Gestión de tanques completa
- Sistema de ventas implementado

## 📝 Notas de Desarrollo

- La aplicación usa standalone components (Angular 19)
- Los formularios utilizan FormsModule y ReactiveFormsModule
- Las gráficas se actualizan dinámicamente con los datos
- El tema de Material es personalizable en [custom-theme.scss](src/styles/custom-theme.scss)

## 🌐 Navegación

### Rutas Públicas
- `/login` - Inicio de sesión
- `/register` - Registro de usuario
- `/verify-email` - Verificación de correo
- `/reiniciar-contraseña` - Recuperación de contraseña
- `/inicio` - Landing page

### Rutas Protegidas (requieren autenticación)
- `/inicioPerfil` - Dashboard principal
- `/estanques` - Gestión de tanques
- `/ciclos` - Gestión de ciclos
- `/inventario` - Gestión de inventario
- `/diario` - Registro diario
- `/empresa` - Información de empresa
- `/configuracion` - Configuración de usuario

## 👨‍💻 Autor

PisciApp Frontend - Interfaz Web para Gestión de Piscicultura

---

**Última actualización**: Diciembre 2025

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
