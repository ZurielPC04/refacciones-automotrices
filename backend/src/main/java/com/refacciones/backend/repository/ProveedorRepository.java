package com.refacciones.backend.repository;

import com.refacciones.backend.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    // SELECT * FROM proveedores WHERE activo = true
    List<Proveedor> findByActivoTrue();

    // SELECT * FROM proveedores WHERE nombre = ?
    Optional<Proveedor> findByNombre(String nombre);

    // Verifica si existe un proveedor con ese nombre y activo
    boolean existsByNombreAndActivoTrue(String nombre);
}
