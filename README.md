# WOM Auth Service Client

<div align="center">

![Angular](https://img.shields.io/badge/Angular-18.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/Material-18.2-757575?style=for-the-badge&logo=material-design&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)

![Jasmine](https://img.shields.io/badge/Jasmine-5.x-8A4182?style=for-the-badge&logo=jasmine&logoColor=white)
![Karma](https://img.shields.io/badge/Karma-6.x-429239?style=for-the-badge&logo=karma&logoColor=white)
![Coverage](https://img.shields.io/badge/Coverage-97.22%25-success?style=for-the-badge)

![PNPM](https://img.shields.io/badge/pnpm-10.x-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)

</div>

---

Cliente de autenticación Angular 18 para WOM Auth Service. Implementa autenticación JWT con refresh tokens, dashboard protegido y arquitectura basada en componentes inteligentes y presentacionales.

## 🚀 Características

- **Angular 18** con Standalone Components y Signals API
- **Autenticación JWT** con refresh token automático
- **Guards funcionales** para protección de rutas
- **Interceptores HTTP** para manejo automático de tokens
- **Material Design 3** con Angular Material 18
- **Arquitectura limpia** siguiendo principios SOLID
- **Componentes OnPush** para máximo rendimiento
- **Cobertura de tests >97%** con Jasmine/Karma
- **Bundle optimizado** (386 kB inicial, 93 kB comprimido)
- **Lazy loading** de módulos de características

## 📋 Requisitos Previos

- **Node.js**: 20.x o superior
- **pnpm**: 10.x (recomendado) o npm
- **Angular CLI**: 18.x

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/kevinbayter/wom-auth-client.git
cd wom-auth-client

# Instalar dependencias
pnpm install
```

## 🏃 Desarrollo

```bash
# Servidor de desarrollo (http://localhost:4200)
pnpm start

# Build de desarrollo con watch mode
pnpm watch

# Ejecutar tests
pnpm test

# Ejecutar tests con cobertura
pnpm test:ci

# Build de producción
pnpm build
```

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios singleton y configuración
│   │   ├── guards/             # Guards funcionales (auth.guard.ts)
│   │   ├── interceptors/       # HTTP interceptors (auth.interceptor.ts)
│   │   └── services/           # Servicios core (auth, token)
│   ├── features/               # Módulos de características
│   │   ├── auth/              # Feature de autenticación
│   │   │   ├── login-page/    # Smart container
│   │   │   ├── login-form/    # Presentational
│   │   │   └── login-branding/ # Presentational
│   │   └── dashboard/         # Feature de dashboard
│   │       ├── dashboard-page/ # Smart container
│   │       ├── dashboard-header/ # Presentational
│   │       ├── user-stats-cards/ # Presentational
│   │       └── user-profile-card/ # Presentational
│   └── shared/                # Componentes y utilidades compartidas
```

### Patrones Implementados

#### Smart vs Presentational Components

- **Smart Components** (Container): Manejan lógica de negocio, interactúan con servicios
  - `LoginPageComponent`: 54 líneas
  - `DashboardPageComponent`: 75 líneas

- **Presentational Components**: Solo reciben datos via `@Input()` y emiten eventos via `@Output()`
  - Todos con `ChangeDetectionStrategy.OnPush`
  - Sin inyección de dependencias
  - Componentes puros y reutilizables

#### Gestión de Estado con Signals

```typescript
// AuthService - Estado reactivo con Signals
readonly isAuthenticated = computed(() => !!this.currentUser());
readonly currentUser = signal<UserProfile | null>(null);
```

#### Guards Funcionales

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return true;
};
```

## 🔐 Seguridad

### Gestión de Tokens

- **Access Token**: Almacenado en **memoria** (variable privada)
  - Mayor seguridad contra XSS
  - No persiste en navegador
  - Se pierde al recargar página

- **Refresh Token**: Almacenado en **sessionStorage**
  - Permite recuperar sesión después de recarga
  - Se elimina al cerrar pestaña
  - Protegido contra CSRF

### Decisiones de Seguridad

❌ **No usamos localStorage** para tokens
- Vulnerable a XSS
- Persiste indefinidamente

✅ **sessionStorage para refresh token**
- Balance entre UX y seguridad
- Sesión limitada a pestaña del navegador

✅ **Memoria para access token**
- Máxima protección contra XSS
- Token no accesible desde JS externo

## 🧪 Testing

### Cobertura Actual: **97.22%**

```bash
# Ejecutar todos los tests
pnpm test

# Tests en modo CI (sin watch)
pnpm test:ci

# Tests con reporte de cobertura
pnpm test -- --code-coverage
```

### Tests Implementados

- **TokenService**: 13 tests (100% coverage)
  - Gestión de access tokens
  - Gestión de refresh tokens
  - Verificación de tokens
  - Limpieza de tokens

- **AuthService**: 20 tests (96%+ coverage)
  - Login exitoso/fallido
  - Logout simple/completo
  - Refresh de tokens
  - Carga de perfil
  - Gestión de estado

- **Components**: Tests de integración
  - Renderizado correcto
  - Interacciones de usuario
  - Emisión de eventos

## 📦 Bundle Size

### Build de Producción

```
Initial Chunk Files               | Size (compressed)
main-HASH.js                      | 93.10 kB
polyfills-HASH.js                 | 0.00 kB
styles-HASH.css                   | 0.00 kB

Lazy Chunk Files                  | Size (compressed)
chunk-login-HASH.js               | 21.96 kB
chunk-dashboard-HASH.js           | 18.82 kB

Total Size: 386.16 kB (133.88 kB compressed)
```

### Optimizaciones Aplicadas

- Tree shaking automático
- Lazy loading de rutas
- OnPush change detection
- Standalone components (sin NgModules)
- Code splitting por features

## 🔌 Integración con Backend

### Variables de Entorno

Configurar en `src/environments/`:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.wom.com/v1'
};
```

### Endpoints Utilizados

```
POST   /auth/login              # Autenticación
POST   /auth/refresh            # Refresh de token
POST   /auth/logout             # Logout simple
POST   /auth/logout-all         # Logout de todos los dispositivos
GET    /auth/me                 # Obtener perfil del usuario
```

### CORS Configuration

El backend debe configurar:

```typescript
// Permitir credenciales
credentials: true

// Permitir headers
Access-Control-Allow-Headers: 
  - Authorization
  - Content-Type
  
// Permitir métodos
Access-Control-Allow-Methods:
  - GET, POST, PUT, DELETE, OPTIONS
```

## 📝 Reglas de Desarrollo

### Límites de Código

- **Componentes**: Máximo 250 líneas
- **Servicios**: Máximo 300 líneas
- **Archivos de test**: Sin límite estricto

### Convenciones

- ✅ TypeScript strict mode
- ✅ No usar `any` type
- ✅ Componentes standalone
- ✅ Functional guards e interceptors
- ✅ OnPush para componentes presentacionales
- ✅ Signals para estado reactivo

## 🚢 CI/CD

### GitHub Actions Pipeline

El workflow automático ejecuta:

1. **Lint**: Verificación de código (placeholder)
2. **Tests**: Ejecución de suite completa
3. **Coverage**: Upload a Codecov
4. **Build**: Build de producción
5. **Bundle Analysis**: Análisis de tamaño

### Branch Protection

- **master**: Rama protegida
  - Requiere PR para merge
  - Requiere CI passing
  - Requiere code review

## 🤝 Contribuir

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit de cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request hacia `master`

### Commits Convencionales

```
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma faltante, etc
refactor: refactorización de código
test: agregar tests
chore: actualizar tareas de build, configuración, etc
```

## 👥 Autores

- **Kevin Bayter** - [kevinbayter](https://github.com/kevinbayter)

## 🙏 Agradecimientos

- Equipo de WOM por los requisitos y feedback
- Comunidad de Angular por las mejores prácticas
- Material Design por el sistema de diseño

---

**Versión**: 1.0.0  
**Angular**: 18.2.14  
**Última actualización**: Octubre 2025
