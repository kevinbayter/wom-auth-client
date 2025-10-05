# 📋 PLAN DE DESARROLLO - WOM AUTH CLIENT (Angular)

> **Fecha de inicio:** Octubre 4, 2025  
> **Duración estimada:** 1 día intensivo (< 12 horas)  
> **Stack:** Angular 15+, TypeScript, RxJS, Docker, Nginx

---

## 🎯 Objetivo del Proyecto

Implementar un **cliente de autenticación robusto, seguro y con una excelente experiencia de usuario**, que se integre perfectamente con la API de `wom-auth-service-api`. El objetivo es demostrar expertise senior en desarrollo frontend mediante la aplicación de patrones de diseño modernos, gestión de estado reactiva y un enfoque en la seguridad y el rendimiento.

### ✅ Estado del Backend

**Backend verificado y funcionando correctamente:**
- ✅ Health Check: PostgreSQL + Redis UP
- ✅ POST /auth/login - Funcional
- ✅ POST /auth/refresh - Token rotation funcionando
- ✅ POST /auth/logout - Funcionando
- ✅ POST /auth/logout-all - Funcionando
- ✅ GET /auth/me - Funcionando con Bearer token
- ✅ Manejo de errores 401/403 correcto

---

## 📐 REGLAS FUNDAMENTALES DEL DESARROLLO

### 1. Principios de Diseño Frontend - NO NEGOCIABLES

**Componentes Inteligentes vs. Tontos (Smart/Dumb):**  
Separar la lógica de estado (contenedores) de la lógica de presentación (componentes puros).

**Flujo de Datos Unidireccional:**  
El estado fluye hacia abajo (de contenedor a presentacional), las acciones fluyen hacia arriba (eventos).

**Single Source of Truth:**  
El estado de la autenticación reside en UN SOLO LUGAR (ej. `AuthService`), nunca en componentes aislados.

**Inyección de Dependencias:**  
Usar el inyector de Angular para todos los servicios.

---

### 2. Clean Code & TypeScript - Estándares Obligatorios

- ✅ **Tipado Estricto:** NUNCA usar `any`. `strict: true` en `tsconfig.json`.
- ✅ **Programación Reactiva (RxJS):** Preferir el `async` pipe sobre suscripciones manuales para evitar memory leaks.
- ✅ **Nombres Descriptivos:** `user$` para Observables, `LoginFormComponent` para componentes, `AuthService` para servicios.
- ✅ **Componentes Pequeños:** Máximo 250 líneas de TS y 150 de HTML. Si es más grande, se debe dividir.
- ✅ **DRY / YAGNI:** No repetir lógica, no implementar funcionalidades no requeridas.

---

### 3. Testing - Cobertura Mínima 85%

- ✅ Cada servicio debe tener pruebas unitarias.
- ✅ Cada componente debe tener pruebas que verifiquen el comportamiento del usuario, no la implementación interna (preferir **Angular Testing Library**).
- ✅ Casos felices + casos de error (ej. formulario inválido, error de API).

---

### 4. Seguridad - Prioridad Máxima

- ✅ **NUNCA usar localStorage para tokens.** Aunque se sugiere en el pseudo-código de ejemplo, es una mala práctica de seguridad. Se debe justificar la decisión en el `README.md`.
- ✅ **Access Token en Memoria:** Gestionado por un servicio (`AuthService`).
- ✅ **Refresh Token en Cookie HttpOnly:** Gestionado por el backend y el navegador (requiere BFF - Backend For Frontend).
- ✅ **Prevención de XSS:** Confiar en la sanitización automática de Angular y nunca usar `[innerHTML]` con datos de usuario.

**NOTA IMPORTANTE:** Dado que el backend Java actual no gestiona cookies HttpOnly (devuelve los tokens en el JSON response), tenemos dos opciones:

1. **Opción A (Recomendada para producción):** Implementar un BFF en Node.js/Express que maneje las cookies HttpOnly.
2. **Opción B (Para esta prueba técnica):** Usar `sessionStorage` con justificación en el README sobre las limitaciones de seguridad y documentar la arquitectura ideal con BFF.

**Decisión:** Implementaremos la **Opción B** con documentación clara sobre por qué `localStorage` no es seguro y cómo debería implementarse en producción.

---

### 5. Rendimiento

- ✅ **ChangeDetectionStrategy.OnPush:** Usar en todos los componentes de presentación.
- ✅ **Lazy Loading:** Cargar módulos de funcionalidades (feature modules) de forma perezosa.
- ✅ **Bundle Size:** Análisis con `webpack-bundle-analyzer`.

---

### 6. Documentación

- ✅ Documentación de `@Input()` y `@Output()` en componentes compartidos.
- ✅ `README.md` profesional con arquitectura, setup y decisiones de diseño.
- ✅ Comentarios JSDoc en servicios y métodos públicos complejos.

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### Stack Tecnológico

| Categoría | Tecnología | Versión | Justificación |
|-----------|-----------|---------|---------------|
| **Framework** | Angular | 15+ | Requisito del proyecto |
| **Lenguaje** | TypeScript | ~5.0 | Modo estricto habilitado |
| **Programación Reactiva** | RxJS | ~7.8 | Gestión de estado asíncrono |
| **Gestor de Paquetes** | pnpm | 8+ | Más rápido y eficiente que npm |
| **UI Framework** | Angular Material | 15+ | Componentes enterprise-ready |
| **Testing** | Jasmine + Karma | Default | Testing unitario y de integración |
| **Testing (Opcional)** | Jest + Testing Library | Latest | Testing más moderno (si el tiempo lo permite) |
| **Code Quality** | ESLint + Prettier | Latest | Linting y formateo automático |
| **Containerización** | Docker + Nginx | Latest | Despliegue productivo |

---

## 📦 ESTRUCTURA DEL PROYECTO (Angular Best Practices)

```
wom-auth-service-client/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Pipeline CI/CD
├── docker/
│   ├── Dockerfile                    # Multi-stage build con Nginx
│   └── nginx.conf                    # Configuración SPA (fallback a index.html)
├── src/
│   ├── app/
│   │   ├── core/                     # Singleton services, guards, interceptors (CoreModule)
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts     # Protección de rutas autenticadas
│   │   │   │   └── auth.guard.spec.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts           # Adjuntar token + refresh automático
│   │   │   │   ├── jwt.interceptor.spec.ts
│   │   │   │   ├── error.interceptor.ts         # Manejo global de errores HTTP
│   │   │   │   └── error.interceptor.spec.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts              # Lógica de autenticación
│   │   │   │   ├── auth.service.spec.ts
│   │   │   │   ├── token.service.ts             # Gestión de tokens en memoria
│   │   │   │   └── token.service.spec.ts
│   │   │   └── core.module.ts                   # Importado una sola vez en AppModule
│   │   ├── features/                 # Feature modules (lazy loading)
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   ├── login-form/
│   │   │   │   │   │   ├── login-form.component.ts
│   │   │   │   │   │   ├── login-form.component.html
│   │   │   │   │   │   ├── login-form.component.scss
│   │   │   │   │   │   └── login-form.component.spec.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login-page/
│   │   │   │   │   │   ├── login-page.component.ts
│   │   │   │   │   │   ├── login-page.component.html
│   │   │   │   │   │   ├── login-page.component.scss
│   │   │   │   │   │   └── login-page.component.spec.ts
│   │   │   │   ├── auth-routing.module.ts       # Rutas del módulo auth
│   │   │   │   └── auth.module.ts               # Módulo de autenticación
│   │   │   └── dashboard/
│   │   │       ├── pages/
│   │   │       │   ├── dashboard-page/
│   │   │       │   │   ├── dashboard-page.component.ts
│   │   │       │   │   ├── dashboard-page.component.html
│   │   │       │   │   ├── dashboard-page.component.scss
│   │   │       │   │   └── dashboard-page.component.spec.ts
│   │   │       ├── dashboard-routing.module.ts
│   │   │       └── dashboard.module.ts
│   │   ├── shared/                   # Componentes, pipes, directivas reutilizables
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── navbar/
│   │   │   │   │   │   ├── navbar.component.ts
│   │   │   │   │   │   ├── navbar.component.html
│   │   │   │   │   │   ├── navbar.component.scss
│   │   │   │   │   │   └── navbar.component.spec.ts
│   │   │   │   │   └── footer/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── error-message/
│   │   │   ├── models/               # Interfaces y tipos TypeScript
│   │   │   │   ├── auth.model.ts     # LoginRequest, LoginResponse, etc.
│   │   │   │   └── user.model.ts     # User, UserStatus, etc.
│   │   │   └── shared.module.ts      # Exporta componentes compartidos
│   │   ├── app-routing.module.ts     # Rutas principales + lazy loading
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.module.ts
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       └── _variables.scss       # Variables SCSS globales
│   ├── environments/
│   │   ├── environment.ts            # Configuración de desarrollo
│   │   └── environment.prod.ts       # Configuración de producción
│   ├── index.html
│   ├── main.ts
│   └── styles.scss                   # Estilos globales
├── .editorconfig
├── .eslintrc.json
├── .prettierrc
├── angular.json
├── karma.conf.js
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── README.md
├── PLAN_DESARROLLO.md               # Este archivo
├── DEVELOPMENT_RULES.md             # Reglas de desarrollo (ya creado)
└── INTEGRATION_GUIDE.md             # Guía de integración con backend
```

---

## 🔄 FASES DE DESARROLLO

### FASE 1: Setup Inicial del Proyecto ⏱️ 2 horas

**Objetivo:** Crear y configurar un proyecto Angular robusto y escalable.

#### Tareas:

- [ ] **1.1** Crear proyecto con Angular CLI y pnpm
  ```bash
  npx @angular/cli@15 new wom-auth-client --routing --style=scss --package-manager=pnpm --standalone=false
  ```

- [ ] **1.2** Configurar `tsconfig.json` con modo estricto
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true
    }
  }
  ```

- [ ] **1.3** Instalar y configurar ESLint y Prettier
  ```bash
  pnpm add -D @angular-eslint/schematics
  ng add @angular-eslint/schematics
  pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
  ```

- [ ] **1.4** Instalar Angular Material
  ```bash
  ng add @angular/material
  ```

- [ ] **1.5** Crear estructura de módulos:
  - `CoreModule` (guards, interceptors, services)
  - `SharedModule` (componentes compartidos)

- [ ] **1.6** Configurar enrutamiento con lazy loading

- [ ] **1.7** Configurar ambientes (development/production)
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080'
  };
  ```

**Entregables:**
- Proyecto Angular funcionando
- Linter configurado
- Estructura de carpetas establecida

---

### FASE 2: Core - Servicios, Guards e Interceptors ⏱️ 4 horas

**Objetivo:** Implementar la plomería de autenticación para comunicarse con el backend.

#### Tareas:

- [ ] **2.1** Crear modelos TypeScript (`shared/models/`)
  - `auth.model.ts`: LoginRequest, LoginResponse, RefreshTokenRequest, etc.
  - `user.model.ts`: User, UserStatus

- [ ] **2.2** Implementar `TokenService` (`core/services/token.service.ts`)
  - Almacenar access token en memoria (BehaviorSubject)
  - Métodos: `setAccessToken()`, `getAccessToken()`, `clearTokens()`
  - Gestionar refresh token en `sessionStorage` (documentar limitación)

- [ ] **2.3** Implementar `AuthService` (`core/services/auth.service.ts`)
  - Métodos:
    - `login(credentials: LoginRequest): Observable<LoginResponse>`
    - `logout(): Observable<void>`
    - `logoutAll(): Observable<void>`
    - `refreshToken(): Observable<RefreshTokenResponse>`
    - `getCurrentUser(): Observable<User>`
  - Estado observable:
    - `isAuthenticated$: Observable<boolean>`
    - `currentUser$: Observable<User | null>`

- [ ] **2.4** Implementar `JwtInterceptor` (`core/interceptors/jwt.interceptor.ts`)
  - Adjuntar `Authorization: Bearer <token>` en cada request
  - Manejar respuesta 401 (Unauthorized):
    - Intentar refresh token automáticamente
    - Si refresh falla, redirigir a login
  - Implementar lógica de "request queue" durante el refresh

- [ ] **2.5** Implementar `ErrorInterceptor` (`core/interceptors/error.interceptor.ts`)
  - Capturar errores HTTP globalmente
  - Transformar errores del backend a mensajes user-friendly
  - Logging de errores

- [ ] **2.6** Implementar `AuthGuard` (`core/guards/auth.guard.ts`)
  - Proteger rutas autenticadas
  - Redirigir a `/login` si no está autenticado
  - Guardar URL original para redirección post-login

- [ ] **2.7** Pruebas Unitarias
  - `auth.service.spec.ts`: Testear login, logout, refresh
  - `jwt.interceptor.spec.ts`: Testear adjuntar token y refresh automático
  - `auth.guard.spec.ts`: Testear redirección

**Entregables:**
- Servicios core funcionando
- Interceptors configurados
- Guard implementado
- Tests con >90% de cobertura en services

---

### FASE 3: Módulo de Autenticación - UI y Flujo de Login ⏱️ 3 horas

**Objetivo:** Crear la interfaz para que el usuario inicie sesión.

#### Tareas:

- [ ] **3.1** Crear `AuthModule` (feature module con lazy loading)
  ```bash
  ng generate module features/auth --route auth --module app.module
  ```

- [ ] **3.2** Crear `LoginFormComponent` (Presentational Component)
  - Formulario reactivo con validaciones:
    - `identifier`: required, email o minlength(3)
    - `password`: required, minlength(6)
  - Outputs: `@Output() submitLogin: EventEmitter<LoginRequest>`
  - Inputs: `@Input() isLoading: boolean`, `@Input() error: string | null`
  - ChangeDetection: OnPush

- [ ] **3.3** Crear `LoginPageComponent` (Smart Component)
  - Consumir `AuthService`
  - Manejar estado: loading, error, success
  - Redirigir al dashboard en login exitoso

- [ ] **3.4** Estilos con Angular Material
  - Mat-form-field
  - Mat-button
  - Mat-progress-spinner (loading)
  - Mat-error (validación)

- [ ] **3.5** Manejo de Errores User-Friendly
  - 401: "Usuario o contraseña incorrectos"
  - 403: "Cuenta bloqueada. Contacta soporte."
  - 429: "Demasiados intentos. Intenta más tarde."
  - 500: "Error del servidor. Intenta más tarde."

- [ ] **3.6** Tests de Componente
  - `login-form.component.spec.ts`: Validaciones, emisión de eventos
  - `login-page.component.spec.ts`: Integración con AuthService (mocked)

**Entregables:**
- Página de login funcional
- Validaciones de formulario
- Manejo de errores
- Tests de componentes

---

### FASE 4: Módulo Protegido - Dashboard y Perfil de Usuario ⏱️ 2 horas

**Objetivo:** Crear una sección protegida para validar que el flujo de seguridad funciona.

#### Tareas:

- [ ] **4.1** Crear `DashboardModule` con lazy loading
  ```bash
  ng generate module features/dashboard --route dashboard --module app.module
  ```

- [ ] **4.2** Proteger ruta con `AuthGuard`
  ```typescript
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  }
  ```

- [ ] **4.3** Crear `DashboardPageComponent`
  - Consumir `AuthService.getCurrentUser()` para obtener datos del usuario
  - Mostrar: nombre, email, username, última conexión
  - Botón "Logout" y "Logout All Devices"

- [ ] **4.4** Crear `NavbarComponent` en `SharedModule`
  - Mostrar nombre de usuario
  - Botón de logout
  - Mostrar solo si está autenticado (usar `AuthService.isAuthenticated$`)

- [ ] **4.5** Tests
  - `dashboard-page.component.spec.ts`: Carga de datos, logout

**Entregables:**
- Dashboard protegido funcionando
- Navbar con logout
- Datos de usuario mostrados correctamente

---

### FASE 5: Testing Completo y Calidad de Código ⏱️ 3 horas

**Objetivo:** Asegurar la calidad y robustez del cliente.

#### Tareas:

- [ ] **5.1** Completar tests unitarios faltantes
  - Todos los services >90%
  - Todos los guards >90%
  - Todos los interceptors >90%

- [ ] **5.2** Tests de componentes con Angular Testing Library (opcional)
  - Login flow completo
  - Error handling
  - Form validation

- [ ] **5.3** Test de integración E2E (opcional si hay tiempo)
  - Login -> Dashboard -> Logout

- [ ] **5.4** Análisis de cobertura
  ```bash
  ng test --code-coverage
  ```
  - Objetivo: >85% global

- [ ] **5.5** Linting y formateo
  ```bash
  pnpm lint
  pnpm format
  ```

- [ ] **5.6** Bundle size analysis
  ```bash
  ng build --stats-json
  npx webpack-bundle-analyzer dist/wom-auth-client/stats.json
  ```

**Entregables:**
- Cobertura >85%
- Código limpio y formateado
- Sin errores de linting

---

### FASE 6: Dockerización, CI/CD y Documentación Final ⏱️ 2 horas

**Objetivo:** Empaquetar el proyecto para una ejecución simplificada.

#### Tareas:

- [ ] **6.1** Crear `Dockerfile` multi-stage con Nginx
  ```dockerfile
  # Stage 1: Build
  FROM node:18-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm install -g pnpm
  RUN pnpm install
  COPY . .
  RUN pnpm run build --configuration=production

  # Stage 2: Serve
  FROM nginx:alpine
  COPY --from=build /app/dist/wom-auth-client /usr/share/nginx/html
  COPY docker/nginx.conf /etc/nginx/nginx.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] **6.2** Crear `nginx.conf` para SPA
  ```nginx
  server {
    listen 80;
    location / {
      root /usr/share/nginx/html;
      try_files $uri $uri/ /index.html;
    }
  }
  ```

- [ ] **6.3** Actualizar `docker-compose.yml` del backend para incluir frontend
  ```yaml
  services:
    frontend:
      build:
        context: ../wom-auth-service-client
        dockerfile: docker/Dockerfile
      ports:
        - "4200:80"
      depends_on:
        - backend
  ```

- [ ] **6.4** Configurar GitHub Actions CI/CD
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
        - run: npm install -g pnpm
        - run: pnpm install
        - run: pnpm lint
        - run: pnpm test -- --watch=false --code-coverage
        - run: pnpm build --configuration=production
  ```

- [ ] **6.5** Escribir `README.md` profesional
  - Descripción del proyecto
  - Arquitectura
  - Setup local
  - Decisiones de diseño (seguridad, tokens)
  - Stack tecnológico
  - Scripts disponibles

- [ ] **6.6** Actualizar `INTEGRATION_GUIDE.md` con ejemplos de Angular

**Entregables:**
- Docker funcionando
- CI/CD pipeline configurado
- README completo
- Proyecto listo para entregar

---

## 📊 MÉTRICAS DE ÉXITO (< 1.5 DÍAS)

### Funcionales ✅

- [ ] Login funcional contra el backend en Docker
- [ ] Renovación de token automática y transparente para el usuario
- [ ] Rutas protegidas son inaccesibles sin login y redirigen correctamente
- [ ] Logout limpia el estado de la sesión y redirige al login
- [ ] Logout All Devices funciona correctamente
- [ ] Se muestra la información del usuario en la página protegida

### Calidad de Código ✅

- [ ] Cobertura de tests >85%
- [ ] Estructura de módulos Core/Shared/Features aplicada
- [ ] No hay `any` en el código
- [ ] No hay suscripciones manuales sin gestionar (preferir async pipe)
- [ ] `OnPush` en componentes de presentación
- [ ] Código pasa linting sin errores

### Operacional ✅

- [ ] El `docker-compose up` del backend levanta también el frontend
- [ ] La aplicación es accesible en `http://localhost:4200`
- [ ] CI/CD pipeline exitoso en cada push
- [ ] README documenta correctamente el setup

---

## 🚀 ORDEN DE EJECUCIÓN OPTIMIZADO (1 DÍA INTENSIVO)

### 🌅 Mañana (4 horas - 8:00 AM - 12:00 PM)

- **08:00 - 10:00** → FASE 1: Setup del Proyecto (2h)
- **10:00 - 12:00** → FASE 2: Servicios Core (2h)

### 🌞 Tarde (5 horas - 13:00 PM - 18:00 PM)

- **13:00 - 14:00** → FASE 2 (continuación): Guards e Interceptors (1h)
- **14:00 - 16:30** → FASE 3: UI de Login (2.5h)
- **16:30 - 18:00** → FASE 4: Dashboard Protegido (1.5h)

### 🌙 Noche (3 horas - 19:00 PM - 22:00 PM)

- **19:00 - 21:00** → FASE 5: Testing Completo (2h)
- **21:00 - 22:00** → FASE 6: Dockerización y Documentación Final (1h)

**Total: 12 horas distribuidas en 1 día**

---

## 🎯 DIFERENCIADORES SENIOR QUE TE HARÁN DESTACAR

### 1. 🔒 Seguridad Proactiva
**Ignorar la sugerencia de localStorage** y justificar el porqué en el README es una señal inequívoca de seniority. Documentar la arquitectura ideal con BFF demuestra conocimiento arquitectónico.

### 2. 🏗️ Arquitectura Escalable
Usar una estructura de **Core/Shared/Features** con lazy loading demuestra que piensas en el crecimiento y mantenimiento a largo plazo.

### 3. ⚡ Programación Reactiva
Un uso magistral de **RxJS** (especialmente en el interceptor con refresh token) y el **async pipe** muestra dominio de patrones modernos de frontend.

### 4. 🧪 Testing Centrado en el Usuario
Testear **lo que el usuario ve y hace**, en lugar de los detalles internos del componente, es una práctica moderna y robusta.

### 5. 🐳 Entrega Unificada con Docker
Proveer una experiencia de **"un solo comando"** para levantar el stack completo es un diferenciador masivo.

### 6. 📚 Documentación Profesional
README detallado con decisiones de diseño, arquitectura y setup paso a paso demuestra profesionalismo.

### 7. 🎨 UX/UI Pulida
Uso de Angular Material para una interfaz profesional, loading states, error handling user-friendly.

### 8. 🔄 CI/CD desde el Inicio
Pipeline configurado desde el principio demuestra mentalidad DevOps.

---

## 📝 NOTAS FINALES

### Decisiones de Diseño Justificadas

1. **sessionStorage en lugar de localStorage:**
   - Tokens se borran automáticamente al cerrar pestaña
   - Menos vulnerable que localStorage (aunque no ideal)
   - Documentar arquitectura ideal con BFF + cookies HttpOnly

2. **Angular Material sobre Tailwind:**
   - Componentes enterprise-ready out-of-the-box
   - Accesibilidad integrada (a11y)
   - Consistencia visual garantizada

3. **Lazy Loading desde el inicio:**
   - Mejor performance inicial
   - Escalabilidad futura
   - Best practice de Angular

4. **pnpm sobre npm:**
   - Instalación más rápida
   - Menor uso de disco
   - Mejor para monorepos (futura escalabilidad)

---

## 🔗 Referencias

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Angular Security Guide](https://angular.io/guide/security)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) - Reglas específicas del proyecto
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Guía de integración con backend

---

**Última actualización:** Octubre 4, 2025  
**Autor:** Kevin Bayter  
**Proyecto:** WOM Auth Service Client  
**Estado:** ✅ Backend verificado y funcionando
