package com.refacciones.backend.repository;

import com.refacciones.backend.model.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModeloRepository extends JpaRepository<Modelo, Integer> {

    // SELECT * FROM modelos WHERE activo = true
    List<Modelo> findByActivoTrue();

    // SELECT * FROM modelos WHERE id_marca = ? AND activo = true
    List<Modelo> findByMarcaIdAndActivoTrue(Integer idMarca);

    // SELECT * FROM modelos WHERE nombre = ? AND id_marca = ?
    boolean existsByNombreAndMarcaId(String nombre, Integer idMarca);
}
