package com.refacciones.backend.service;

import com.refacciones.backend.dto.UsuarioRequest;
import com.refacciones.backend.dto.UsuarioResponse;
import com.refacciones.backend.model.Usuario;
import com.refacciones.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Listar todos los usuarios activos
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findByActivoTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Obtener usuario por id
    public UsuarioResponse obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        return toResponse(usuario);
    }

    // Crear nuevo usuario
    public UsuarioResponse crear(UsuarioRequest request) {
        // Verificar que no exista un usuario con ese email
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con el email: " + request.getEmail());
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(request.getPassword());
        usuario.setRol(request.getRol());
        usuario.setActivo(true);

        return toResponse(usuarioRepository.save(usuario));
    }

    // Actualizar usuario
    public UsuarioResponse actualizar(Integer id, UsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(request.getPassword());
        usuario.setRol(request.getRol());

        return toResponse(usuarioRepository.save(usuario));
    }

    // Desactivar usuario (borrado lógico)
    public void eliminar(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
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
