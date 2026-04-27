package com.refacciones.backend.service;

import com.refacciones.backend.dto.LoginRequest;
import com.refacciones.backend.dto.UsuarioResponse;
import com.refacciones.backend.model.Usuario;
import com.refacciones.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Login: verifica credenciales y crea la sesión
    public UsuarioResponse login(LoginRequest request, HttpSession session) {

        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmailAndActivoTrue(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        // Verificar la contraseña (comparación directa por ahora)
        if (!usuario.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        // Guardar el usuario en la sesión
        session.setAttribute("usuario", usuario);

        return toResponse(usuario);
    }

    // Logout: destruye la sesión
    public void logout(HttpSession session) {
        session.invalidate();
    }

    // Me: retorna el usuario de la sesión activa
    public UsuarioResponse me(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            throw new RuntimeException("No hay sesión activa");
        }
        return toResponse(usuario);
    }

    // Convertir Usuario → UsuarioResponse
    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.getActivo()
        );
    }
}
