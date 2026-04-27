package com.refacciones.backend.config;

import com.refacciones.backend.model.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // Permitir solicitudes OPTIONS (preflight de CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        HttpSession session = request.getSession(false);

        // Si no hay sesión activa → 401 No autenticado
        if (session == null || session.getAttribute("usuario") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"No autenticado. Inicia sesión para continuar.\"}");
            return false;
        }

        // Obtener el usuario de la sesión
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        String rol = usuario.getRol();

        // Rutas que solo puede acceder ADMIN
        String uri = request.getRequestURI();
        boolean esRutaAdmin = uri.startsWith("/api/usuarios") ||
                              uri.startsWith("/api/dashboard/resumen");

        // Si la ruta es solo para ADMIN y el usuario es EMPLEADO → 403 Prohibido
        if (esRutaAdmin && "EMPLEADO".equals(rol)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Acceso denegado. Se requiere rol ADMIN.\"}");
            return false;
        }

        // Todo OK → continúa al Controller
        return true;
    }
}
