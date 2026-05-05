package com.refacciones.backend.service;

import com.refacciones.backend.dto.DashboardResumenDTO;
import com.refacciones.backend.dto.MovimientoResponse;
import com.refacciones.backend.dto.RefaccionResponse;
import com.refacciones.backend.repository.MovimientoInventarioRepository;
import com.refacciones.backend.repository.RefaccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private RefaccionRepository refaccionRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Autowired
    private RefaccionService refaccionService;

    // Resumen general del dashboard
    public DashboardResumenDTO obtenerResumen() {
        // Inicio y fin del día actual
        LocalDateTime inicioDia = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime finDia    = LocalDateTime.now().with(LocalTime.MAX);

        // Total de refacciones activas
        Long totalRefacciones = (long) refaccionRepository.findByActivoTrue().size();

        // Total de refacciones con bajo stock
        Long refaccionesBajoStock = (long) refaccionRepository.findBajoStock().size();

        // Entradas del día
        Long entradasHoy = movimientoRepository.countByTipoAndFechaBetween("ENTRADA", inicioDia, finDia);

        // Salidas del día
        Long salidasHoy = movimientoRepository.countByTipoAndFechaBetween("SALIDA", inicioDia, finDia);

        // Total movimientos del día
        Long totalMovimientosHoy = entradasHoy + salidasHoy;

        return new DashboardResumenDTO(
                totalRefacciones,
                refaccionesBajoStock,
                entradasHoy,
                salidasHoy,
                totalMovimientosHoy
        );
    }

    // Lista rápida de piezas con bajo stock
    public List<RefaccionResponse> obtenerBajoStock() {
        return refaccionRepository.findBajoStock()
                .stream()
                .map(refaccionService::toResponse)
                .collect(Collectors.toList());
    }

    // Últimos 10 movimientos registrados
    public List<MovimientoResponse> obtenerMovimientosRecientes() {
        return movimientoRepository.findMovimientosRecientes()
                .stream()
                .limit(10)
                .map(movimiento -> new MovimientoResponse(
                        movimiento.getId(),
                        movimiento.getRefaccion().getId(),
                        movimiento.getRefaccion().getNombre(),
                        movimiento.getTipo(),
                        movimiento.getCantidad(),
                        movimiento.getPrecioUnitario(),
                        movimiento.getMotivo(),
                        movimiento.getProveedor() != null ? movimiento.getProveedor().getId() : null,
                        movimiento.getProveedor() != null ? movimiento.getProveedor().getNombre() : null,
                        movimiento.getUsuario().getId(),
                        movimiento.getUsuario().getNombre(),
                        movimiento.getNotas(),
                        movimiento.getFecha()
                ))
                .collect(Collectors.toList());
    }
}
