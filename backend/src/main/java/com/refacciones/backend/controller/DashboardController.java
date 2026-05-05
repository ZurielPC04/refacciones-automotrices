package com.refacciones.backend.controller;

import com.refacciones.backend.dto.DashboardResumenDTO;
import com.refacciones.backend.dto.MovimientoResponse;
import com.refacciones.backend.dto.RefaccionResponse;
import com.refacciones.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // GET /api/dashboard/resumen → resumen general del sistema
    @GetMapping("/resumen")
    public ResponseEntity<DashboardResumenDTO> obtenerResumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }

    // GET /api/dashboard/bajo-stock → lista rápida de piezas críticas
    @GetMapping("/bajo-stock")
    public ResponseEntity<List<RefaccionResponse>> obtenerBajoStock() {
        return ResponseEntity.ok(dashboardService.obtenerBajoStock());
    }

    // GET /api/dashboard/movimientos-recientes → últimos 10 movimientos
    @GetMapping("/movimientos-recientes")
    public ResponseEntity<List<MovimientoResponse>> obtenerMovimientosRecientes() {
        return ResponseEntity.ok(dashboardService.obtenerMovimientosRecientes());
    }
}
