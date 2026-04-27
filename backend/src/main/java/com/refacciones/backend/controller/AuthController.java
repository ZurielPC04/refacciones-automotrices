package com.refacciones.backend.controller;

import com.refacciones.backend.dto.LoginRequest;
import com.refacciones.backend.dto.UsuarioResponse;
import com.refacciones.backend.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // POST /api/auth/login → inicia sesión
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpSession session) {
        try {
            UsuarioResponse response = authService.login(request, session);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // POST /api/auth/logout → cierra sesión
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok("{\"mensaje\": \"Sesión cerrada correctamente\"}");
    }

    // GET /api/auth/me → retorna el usuario de la sesión activa
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        try {
            UsuarioResponse response = authService.me(session);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
