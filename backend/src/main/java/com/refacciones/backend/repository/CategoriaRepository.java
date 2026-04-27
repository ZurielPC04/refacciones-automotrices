package com.refacciones.backend.repository;

import com.refacciones.backend.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    // SELECT * FROM categorias WHERE activo = true
    List<Categoria> findByActivoTrue();

    // SELECT * FROM categorias WHERE nombre = ?
    Optional<Categoria> findByNombre(String nombre);

    // SELECT * FROM categorias WHERE nombre = ? AND activo = true
    boolean existsByNombreAndActivoTrue(String nombre);
}
