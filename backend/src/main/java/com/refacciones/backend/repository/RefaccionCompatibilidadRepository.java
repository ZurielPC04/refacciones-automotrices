package com.refacciones.backend.repository;

import com.refacciones.backend.model.RefaccionCompatibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefaccionCompatibilidadRepository extends JpaRepository<RefaccionCompatibilidad, Integer> {

    // SELECT * FROM refaccion_compatibilidad WHERE id_refaccion = ?
    List<RefaccionCompatibilidad> findByRefaccionId(Integer idRefaccion);

    // SELECT * FROM refaccion_compatibilidad WHERE id_modelo = ?
    List<RefaccionCompatibilidad> findByModeloId(Integer idModelo);

    // Verifica si ya existe esa combinación refacción + modelo + año
    boolean existsByRefaccionIdAndModeloIdAndAnioDesde(Integer idRefaccion, Integer idModelo, Short anioDesde);

    // Elimina todas las compatibilidades de una refacción
    void deleteByRefaccionId(Integer idRefaccion);
}
