package com.refacciones.backend.repository;

import com.refacciones.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // SELECT * FROM usuarios WHERE email = ?
    Optional<Usuario> findByEmail(String email);

    // SELECT * FROM usuarios WHERE activo = true
    List<Usuario> findByActivoTrue();

    // SELECT * FROM usuarios WHERE email = ? AND activo = true
    Optional<Usuario> findByEmailAndActivoTrue(String email);

    // Verifica si ya existe un usuario con ese email
    boolean existsByEmail(String email);
}
