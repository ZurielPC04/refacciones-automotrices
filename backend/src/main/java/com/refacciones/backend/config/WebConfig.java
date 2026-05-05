package com.refacciones.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    // ─────────────────────────────────────────────────────────────────────────
    // CORS: permite peticiones desde React (CRA corre en http://localhost:3000)
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true); // necesario para que el navegador envíe la cookie de sesión
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Interceptor de autenticación y roles
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                // Rutas que SÍ protege (requieren sesión activa)
                .addPathPatterns("/api/**")
                // Rutas que NO protege (públicas)
                .excludePathPatterns(
                        "/api/auth/login" // Login es público
                );
    }
}
