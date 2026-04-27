package com.refacciones.backend.repository;

import com.refacciones.backend.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Integer> {

    // Historial de movimientos de una refacción ordenado por fecha descendente
    List<MovimientoInventario> findByRefaccionIdOrderByFechaDesc(Integer idRefaccion);

    // Movimientos por tipo (ENTRADA o SALIDA)
    List<MovimientoInventario> findByTipoOrderByFechaDesc(String tipo);

    // Movimientos por motivo (COMPRA, VENTA, REPARACION, etc.)
    List<MovimientoInventario> findByMotivoOrderByFechaDesc(String motivo);

    // Últimos N movimientos (para el dashboard)
    @Query("SELECT m FROM MovimientoInventario m ORDER BY m.fecha DESC")
    List<MovimientoInventario> findMovimientosRecientes();

    // Movimientos del día de hoy
    @Query("SELECT m FROM MovimientoInventario m WHERE m.fecha >= :inicio AND m.fecha <= :fin ORDER BY m.fecha DESC")
    List<MovimientoInventario> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    // Total de movimientos por tipo en un rango de fechas (para dashboard)
    @Query("SELECT COUNT(m) FROM MovimientoInventario m WHERE m.tipo = :tipo AND m.fecha >= :inicio AND m.fecha <= :fin")
    Long countByTipoAndFechaBetween(String tipo, LocalDateTime inicio, LocalDateTime fin);
}
