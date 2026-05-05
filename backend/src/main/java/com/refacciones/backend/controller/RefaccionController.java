package com.refacciones.backend.controller;

import com.refacciones.backend.dto.RefaccionRequest;
import com.refacciones.backend.dto.RefaccionResponse;
import com.refacciones.backend.service.RefaccionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refacciones")
public class RefaccionController {

    @Autowired
    private RefaccionService refaccionService;

    // GET /api/refacciones → listar todo el inventario
    @GetMapping
    public ResponseEntity<List<RefaccionResponse>> listarTodas() {
        return ResponseEntity.ok(refaccionService.listarTodas());
    }

    // GET /api/refacciones/{id} → obtener una refacción
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(refaccionService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // GET /api/refacciones/bajo-stock → refacciones con stock bajo
    @GetMapping("/bajo-stock")
    public ResponseEntity<List<RefaccionResponse>> listarBajoStock() {
        return ResponseEntity.ok(refaccionService.listarBajoStock());
    }

    // GET /api/refacciones/categoria/{idCategoria} → filtrar por categoría
    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<RefaccionResponse>> listarPorCategoria(@PathVariable Integer idCategoria) {
        return ResponseEntity.ok(refaccionService.listarPorCategoria(idCategoria));
    }

    // GET /api/refacciones/{id}/compatibilidades → ver modelos compatibles
    @GetMapping("/{id}/compatibilidades")
    public ResponseEntity<?> listarCompatibilidades(@PathVariable Integer id) {
        try {
            refaccionService.obtenerPorId(id);
            return ResponseEntity.ok("{\"mensaje\": \"Use /api/compatibilidades para gestionar compatibilidades\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // POST /api/refacciones → crear nueva refacción
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody RefaccionRequest request) {
        try {
            RefaccionResponse response = refaccionService.crear(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // PUT /api/refacciones/{id} → actualizar refacción
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @Valid @RequestBody RefaccionRequest request) {
        try {
            return ResponseEntity.ok(refaccionService.actualizar(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // DELETE /api/refacciones/{id} → eliminar refacción
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            refaccionService.eliminar(id);
            return ResponseEntity.ok("{\"mensaje\": \"Refacción eliminada correctamente\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
