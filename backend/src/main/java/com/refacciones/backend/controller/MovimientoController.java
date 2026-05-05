package com.refacciones.backend.controller;

import com.refacciones.backend.dto.MovimientoRequest;
import com.refacciones.backend.dto.MovimientoResponse;
import com.refacciones.backend.service.MovimientoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    @Autowired
    private MovimientoService movimientoService;

    // GET /api/movimientos → listar todos los movimientos
    @GetMapping
    public ResponseEntity<List<MovimientoResponse>> listarTodos() {
        return ResponseEntity.ok(movimientoService.listarTodos());
    }

    // GET /api/movimientos/{id} → obtener un movimiento
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(movimientoService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // GET /api/movimientos/refaccion/{idRefaccion} → historial de una pieza
    @GetMapping("/refaccion/{idRefaccion}")
    public ResponseEntity<List<MovimientoResponse>> listarPorRefaccion(@PathVariable Integer idRefaccion) {
        return ResponseEntity.ok(movimientoService.listarPorRefaccion(idRefaccion));
    }

    // POST /api/movimientos/entrada → registrar entrada (compra o devolución)
    @PostMapping("/entrada")
    public ResponseEntity<?> registrarEntrada(@Valid @RequestBody MovimientoRequest request,
                                              HttpSession session) {
        try {
            MovimientoResponse response = movimientoService.registrarEntrada(request, session);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // POST /api/movimientos/salida → registrar salida (venta o reparación)
    @PostMapping("/salida")
    public ResponseEntity<?> registrarSalida(@Valid @RequestBody MovimientoRequest request,
                                             HttpSession session) {
        try {
            MovimientoResponse response = movimientoService.registrarSalida(request, session);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
