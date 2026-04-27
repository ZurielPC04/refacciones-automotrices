package com.refacciones.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                // Rutas que SÍ protege (requieren sesión activa)
                .addPathPatterns("/api/**")
                // Rutas que NO protege (públicas)
                .excludePathPatterns(
                        "/api/auth/login"   // Login es público
                );
    }
}
