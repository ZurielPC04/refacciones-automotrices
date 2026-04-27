package com.refacciones.backend.repository;

import com.refacciones.backend.model.Refaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefaccionRepository extends JpaRepository<Refaccion, Integer> {

    // SELECT * FROM refacciones WHERE activo = true
    List<Refaccion> findByActivoTrue();

    // SELECT * FROM refacciones WHERE id_categoria = ? AND activo = true
    List<Refaccion> findByCategoriaIdAndActivoTrue(Integer idCategoria);

    // SELECT * FROM refacciones WHERE numero_parte = ?
    Optional<Refaccion> findByNumeroParte(String numeroParte);

    // Verifica si ya existe una refacción con ese número de parte
    boolean existsByNumeroParte(String numeroParte);

    // Refacciones con stock_actual <= stock_minimo (bajo stock)
    @Query("SELECT r FROM Refaccion r WHERE r.stockActual <= r.stockMinimo AND r.activo = true")
    List<Refaccion> findBajoStock();

    // Búsqueda por nombre (contiene el texto)
    @Query("SELECT r FROM Refaccion r WHERE LOWER(r.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND r.activo = true")
    List<Refaccion> findByNombreContaining(String nombre);
}
