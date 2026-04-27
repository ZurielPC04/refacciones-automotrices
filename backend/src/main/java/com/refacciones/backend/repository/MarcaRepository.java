package com.refacciones.backend.repository;

import com.refacciones.backend.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Integer> {

    // SELECT * FROM marcas WHERE activo = true
    List<Marca> findByActivoTrue();

    // SELECT * FROM marcas WHERE nombre = ?
    Optional<Marca> findByNombre(String nombre);

    // SELECT * FROM marcas WHERE nombre = ? AND activo = true
    Optional<Marca> findByNombreAndActivoTrue(String nombre);
}
