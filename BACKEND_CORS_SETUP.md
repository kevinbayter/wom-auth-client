# Configuración CORS para Backend (Spring Boot)

## Problema

El frontend en `http://localhost:4200` no puede hacer peticiones al backend en `http://localhost:8080` debido a restricciones CORS.

**Error en consola:**
```
Access to XMLHttpRequest at 'http://localhost:8080/auth/login' from origin 'http://localhost:4200' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solución

### Opción 1: Configuración Global (Recomendada)

Crea o modifica el archivo `WebConfig.java` en tu proyecto backend:

```java
package com.wom.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/auth/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Opción 2: Usando @CrossOrigin en Controllers

Si prefieres hacerlo por controller, agrega la anotación:

```java
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {
    // ... tus endpoints
}
```

### Opción 3: Spring Security CORS

Si usas Spring Security, agrega en tu `SecurityConfig`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // ... resto de configuración
            
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/auth/**", configuration);
        
        return source;
    }
}
```

## Configuración para Producción

⚠️ **IMPORTANTE**: En producción, **NO uses `*` ni `http://localhost:4200`**

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/auth/**")
                .allowedOrigins(allowedOrigins)  // Leer desde application.properties
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**application.properties (desarrollo):**
```properties
app.cors.allowed-origins=http://localhost:4200
```

**application-prod.properties (producción):**
```properties
app.cors.allowed-origins=https://tu-dominio.com
```

## Verificación

Después de aplicar la configuración:

1. Reinicia el backend
2. Abre http://localhost:4200
3. Intenta hacer login con:
   - **Email**: `admin@test.com`
   - **Password**: `admin123`

Deberías ver en la consola del navegador:
- ✅ Request a `/auth/login` exitoso
- ✅ Response con tokens
- ✅ Navegación automática a `/dashboard`

## Troubleshooting

### Error persiste después de configuración

1. **Verifica que el backend esté corriendo** en `http://localhost:8080`
2. **Limpia caché del navegador** o usa modo incógnito
3. **Verifica logs del backend** para confirmar que la configuración se cargó
4. **Prueba con curl**:
   ```bash
   curl -X POST http://localhost:8080/auth/login \
     -H "Content-Type: application/json" \
     -H "Origin: http://localhost:4200" \
     -d '{"identifier":"admin@test.com","password":"admin123"}' \
     -v
   ```

### Respuesta OPTIONS 403

Si el preflight OPTIONS falla, verifica que:
- Spring Security permita OPTIONS sin autenticación
- El método OPTIONS esté en `allowedMethods`

```java
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
```

---

**Documentación oficial**:
- [Spring CORS Documentation](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
- [Spring Security CORS](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)
