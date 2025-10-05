# 📜 REGLAS DE DESARROLLO - WOM AUTH CLIENT

## 🎯 MANIFIESTO DEL DESARROLLADOR FRONTEND SENIOR

> *"La web es como un rascacielos. La base tiene que ser sólida, o todo se derrumbará. El rendimiento, la accesibilidad y una buena gestión del estado son esa base."*

Este documento establece las reglas **OBLIGATORIAS** que deben cumplirse en el desarrollo del cliente de autenticación. Estas reglas garantizan una experiencia de usuario fluida, un rendimiento óptimo y un código mantenible.

---

## 🏛️ I. PRINCIPIOS DE DISEÑO DE COMPONENTES Y SERVICIOS

### 1. Single Responsibility Principle (SRP)

**REGLA:** Un componente, servicio o pipe debe tener una sola razón para cambiar.

#### ✅ Cumplimiento:

- **Componentes de Presentación (Dumb Components)**: SOLO se encargan de mostrar datos y emitir eventos. No tienen lógica de negocio.
- **Componentes Contenedores (Smart Components)**: SOLO orquestan, obtienen datos a través de servicios y los pasan a los componentes de presentación.
- **Servicios** (`AuthService`, `TokenService`): SOLO manejan la lógica de negocio (llamadas API, gestión de estado).

#### ❌ Prohibido:

```typescript
// MAL - Componente que hace de todo (mezcla UI, estado y llamadas API)
@Component({ ... })
export class LoginComponent {
  constructor(private http: HttpClient) {}

  login(form: NgForm) {
    // ❌ Lógica de llamada API dentro del componente
    this.http.post('/api/login', form.value).subscribe(res => {
      // ❌ Lógica de gestión de estado
      localStorage.setItem('token', res.token);
      // ❌ Lógica de navegación
      this.router.navigate(['/dashboard']);
    });
  }
}
```

#### ✅ Correcto:

```typescript
// BIEN - Responsabilidades separadas
@Component({ ... })
export class LoginComponent {
  // Solo se comunica con el servicio
  constructor(private authService: AuthService) {}

  login(credentials: Credentials) {
    this.authService.login(credentials);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // El servicio se encarga de la lógica
  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {}

  login(credentials: Credentials): void {
    this.http.post<LoginResponse>('/api/login', credentials).subscribe(res => {
      this.tokenService.saveTokens(res);
      this.router.navigate(['/dashboard']);
    });
  }
}
```

---

### 2. Open/Closed Principle (OCP)

**REGLA:** Abierto para extensión, cerrado para modificación.

#### ✅ Cumplimiento:

- Usar componentes dinámicos o `ng-content` para permitir la extensibilidad de la UI.
- Directivas personalizadas para añadir comportamiento sin cambiar el componente.

**Ejemplo de diseño extensible (Custom Form Field):**

```typescript
// Componente de campo de texto extensible
@Component({
  selector: 'app-text-field',
  template: `
    <label>{{ label }}</label>
    <input type="text">
    <ng-content select="[error]"></ng-content>
  `
})
export class TextFieldComponent {
  @Input() label: string;
}

// Uso:
<app-text-field label="Email">
  <div error *ngIf="form.controls.email.invalid">Email inválido.</div>
</app-text-field>
```

---

### 3. Dependency Inversion Principle (DIP)

**REGLA:** Depender de abstracciones, no de implementaciones.

#### ✅ Cumplimiento OBLIGATORIO:

- SIEMPRE usar el inyector de dependencias de Angular.
- SIEMPRE inyectar servicios en los constructores.
- Usar `InjectionToken` para dependencias abstractas cuando sea necesario.

```typescript
// BIEN
@Component({ ... })
export class DashboardComponent {
  // Depende de la abstracción del servicio, no de una instancia concreta
  constructor(private readonly authService: AuthService) {}
}
```

#### ❌ Prohibido:

```typescript
// MAL - Acoplamiento duro
@Component({ ... })
export class DashboardComponent {
  private authService: AuthService;
  constructor() {
    // ❌ Creación manual de la instancia
    this.authService = new AuthService(new HttpClient(), ...);
  }
}
```

---

## 🧹 II. CLEAN CODE & TYPESCRIPT - REGLAS ESTRICTAS

### 1. Naming Conventions (Angular Style Guide)

#### ✅ DEBE:

- **Componentes**: PascalCase con sufijo `Component` (ej: `LoginFormComponent`)
- **Servicios**: PascalCase con sufijo `Service` (ej: `AuthService`)
- **Directivas**: camelCase con sufijo `Directive` (ej: `highlightDirective`)
- **Pipes**: camelCase con sufijo `Pipe` (ej: `initialsPipe`)
- **Interfaces**: PascalCase sin prefijo `I` (ej: `LoginResponse`)
- **Variables y Métodos**: camelCase (ej: `isUserAuthenticated`, `handleLogin`)
- **Observables**: `$` al final del nombre (ej: `user$`, `isAuthenticated$`)

---

### 2. Tamaño de Componentes y Clases

#### REGLAS ESTRICTAS:

- 🔴 **Archivos de Componente (.ts)**: Máximo 250 líneas.
- 🔴 **Plantillas HTML (.html)**: Máximo 150 líneas.
- 🔴 **Funciones/Métodos**: Máximo 20 líneas.

💡 **Si un componente supera estos límites:**
- Dividirlo en componentes de presentación más pequeños.
- Extraer lógica a servicios o a custom hooks/utilidades.

---

### 3. Tipado Fuerte y Estricto (TypeScript)

**REGLA:** NUNCA usar `any`. Activar `strict: true` en `tsconfig.json`.

#### ❌ MAL:

```typescript
// MAL - Tipos débiles o ausentes
function processResponse(res: any) { // ❌ ANY
  console.log(res.data.token);
}

let user; // ❌ Tipo implícito any
```

#### ✅ BIEN:

```typescript
// BIEN - Interfaces y tipos explícitos
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

function processResponse(response: LoginResponse): void {
  console.log(response.accessToken);
}

let user: User | null = null; // ✅ Tipo explícito
```

---

### 4. Programación Reactiva (RxJS)

**REGLA:** Evitar suscripciones manuales. Usar el `async` pipe SIEMPRE que sea posible.

#### ❌ MAL:

```typescript
// MAL - Suscripción manual propensa a memory leaks
@Component({ ... })
export class UserProfileComponent implements OnInit, OnDestroy {
  username: string;
  private userSubscription: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe(user => { // ❌ Suscripción manual
      this.username = user.name;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe(); // ❌ Fácil de olvidar
  }
}
```

#### ✅ BIEN:

```typescript
// BIEN - Uso del pipe async
@Component({
  template: `
    <div *ngIf="user$ | async as user">
      <h1>Welcome, {{ user.name }}</h1>
    </div>
  `
})
export class UserProfileComponent {
  user$: Observable<User>;

  constructor(private userService: UserService) {
    this.user$ = this.userService.user$;
  }
}
```

---

## 🧪 III. TESTING - REGLAS DE CALIDAD

### 1. Cobertura Mínima

#### REGLA OBLIGATORIA: Cobertura >85% en:

- **Services**: >90%
- **Components (Lógica)**: >85%
- **Pipes/Directives/Utils**: >95%

---

### 2. Filosofía de Testing

**REGLA:** Testear el comportamiento del usuario, no los detalles de implementación. Usar preferentemente **Angular Testing Library**.

#### ❌ MAL (Testeando implementación):

```typescript
it('should set loading to true when login is called', () => {
  component.login();
  expect(component.isLoading).toBe(true); // ❌ Acoplado a la implementación interna
});
```

#### ✅ BIEN (Testeando comportamiento):

```typescript
it('should show a loading spinner after clicking the login button', async () => {
  // Arrange
  render(LoginComponent);
  const loginButton = screen.getByRole('button', { name: /log in/i });

  // Act
  fireEvent.click(loginButton);

  // Assert
  // ✅ Busca el resultado visible para el usuario
  expect(await screen.findByRole('progressbar')).toBeInTheDocument();
});
```

---

## 🔒 IV. SEGURIDAD - REGLAS INNEGOCIABLES

### 1. Almacenamiento de Tokens

**REGLA:** NUNCA usar `localStorage` o `sessionStorage` para almacenar tokens JWT.

#### ✅ Cumplimiento:

- **Access Token**: Debe almacenarse exclusivamente en **memoria**, dentro de un servicio de estado (ej. `AuthService`) utilizando un `BehaviorSubject` de RxJS. Esto lo aísla del acceso directo y previene su persistencia en el navegador, reduciendo la superficie de ataque.

- **Refresh Token**: Este token, por ser de larga duración, NO debe ser manejable por el cliente. Debe ser gestionado automáticamente por el navegador a través de una **cookie segura** con los atributos `HttpOnly` y `Secure`, la cual es establecida por el backend.

#### ✅ Documentación en README.md:

**Decisión de Diseño: Almacenamiento Seguro de Tokens**

> *"A pesar de que el reto sugería el uso de localStorage, se ha evitado intencionadamente esta práctica debido a su conocida vulnerabilidad a ataques de Cross-Site Scripting (XSS). En su lugar, se ha implementado una estrategia de seguridad superior:*
> 
> - *El Access Token se gestiona exclusivamente en la memoria de la aplicación (dentro de un servicio de Angular).*
> - *El Refresh Token es manejado por el backend a través de una cookie HttpOnly y Secure, haciéndolo inaccesible para cualquier script del lado del cliente.*
> 
> *Esta decisión prioriza la seguridad, una práctica fundamental en el desarrollo de sistemas de autenticación de nivel profesional."*

---

### 2. Prevención de XSS

**REGLA:** Confiar en la sanitización automática de Angular. NUNCA usar `[innerHTML]` con datos del usuario sin sanitizar.

#### ❌ PROHIBIDO:

```typescript
// MAL - Vulnerabilidad XSS
@Component({
  template: `<div [innerHTML]="userInput"></div>` // ❌ PELIGROSO
})
export class VulnerableComponent {
  userInput = '<img src="invalid" onerror="alert(\'XSS Attack!\')">';
}
```

#### ✅ BIEN:

```typescript
// BIEN - Angular lo sanitiza por defecto
@Component({
  template: `<div>{{ userInput }}</div>` // ✅ Seguro
})
export class SafeComponent {
  userInput = '<script>alert("XSS")</script>'; // Se mostrará como texto plano
}
```

---

## 🗄️ V. GESTIÓN DEL ESTADO - REGLA DE ÚNICA FUENTE DE VERDAD

### 1. Single Source of Truth

**REGLA:** El estado de la aplicación (ej. información del usuario, estado de autenticación) debe residir en UN SOLO LUGAR (un servicio, una store) y fluir de forma unidireccional.

#### ✅ BIEN:

```typescript
// AuthService es la única fuente de la verdad sobre la autenticación
@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // ... métodos de login/logout que actualizan el subject
}

// Un componente consume este estado
@Component({ ... })
export class NavbarComponent {
  isAuthenticated$ = this.authService.isAuthenticated$;
}
```

#### ❌ MAL:

```typescript
// MAL - Múltiples fuentes de verdad
// Componente 1
isAuthenticated = false;
login() { this.isAuthenticated = true; }

// Componente 2
isLoggedIn = false;
checkLogin() { this.isLoggedIn = localStorage.getItem('token') ? true : false; }
// ❌ Estado inconsistente y difícil de sincronizar
```

---

## 🚀 VI. PERFORMANCE - REGLAS DE OPTIMIZACIÓN

### 1. Detección de Cambios

**REGLA:** Usar `ChangeDetectionStrategy.OnPush` en TODOS los componentes de presentación.

```typescript
@Component({
  ...,
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ OBLIGATORIO
})
export class MyDumbComponent { ... }
```

---

### 2. Lazy Loading

**REGLA:** Cargar módulos de funcionalidades (feature modules) SIEMPRE usando `loadChildren`.

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'dashboard',
    // ✅ Carga perezosa del módulo del dashboard
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  }
];
```

---

## 🎯 VII. CHECKLIST ANTES DE CADA COMMIT (FRONTEND)

Antes de hacer commit, verificar:

- [ ] ✅ Compila sin errores (`ng build --prod`)
- [ ] ✅ Todos los tests pasan (`ng test`)
- [ ] ✅ Ninguna clase de componente supera 250 líneas
- [ ] ✅ Ninguna plantilla HTML supera 150 líneas
- [ ] ✅ No hay `any` en el código
- [ ] ✅ No hay suscripciones manuales sin `unsubscribe` (preferir `async` pipe)
- [ ] ✅ Componentes de presentación usan `OnPush`
- [ ] ✅ No hay `console.log()` o `debugger`
- [ ] ✅ Nuevos `@Input`/`@Output` tienen documentación
- [ ] ✅ Código formateado con Prettier/Linter
- [ ] ✅ Mensaje de commit descriptivo en una línea y en INGLÉS

---

## 🔥 VIII. ANTI-PATRONES PROHIBIDOS (FRONTEND)

### 1. Prop Drilling
❌ Pasar datos a través de 5 niveles de componentes anidados → ✅ Usar un servicio o store.

### 2. Manipulación Manual del DOM
❌ Usar `document.getElementById` → ✅ Usar `@ViewChild`, `ElementRef` o directivas.

### 3. "God" Components
❌ Un componente con 1000 líneas de HTML y 800 de TS → ✅ Dividir en componentes más pequeños y especializados.

### 4. Lógica de Negocio en Componentes
❌ Componentes que saben cómo funciona el backend → ✅ Mover toda la lógica a servicios.

### 5. No Manejar Errores de API
❌ Un `subscribe()` sin segundo argumento para el error → ✅ SIEMPRE manejar el caso de error.

---

## 📌 RESUMEN EJECUTIVO

Este documento no es opcional. Es la base sobre la que se construye un código de calidad profesional. Cada regla aquí descrita existe por una razón: **prevenir bugs, mejorar la mantenibilidad, optimizar el rendimiento y garantizar la seguridad**.

**Recuerda:** El código se escribe una vez, pero se lee cientos de veces. Hazlo fácil de leer, fácil de mantener y fácil de extender.

---

*Última actualización: Octubre 4, 2025*
