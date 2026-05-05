package com.refacciones.backend.controller;

import com.refacciones.backend.dto.CompatibilidadRequest;
import com.refacciones.backend.dto.CompatibilidadResponse;
import com.refacciones.backend.service.CompatibilidadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compatibilidades")
public class CompatibilidadController {

    @Autowired
    private CompatibilidadService compatibilidadService;

    // GET /api/compatibilidades/refaccion/{idRefaccion} → listar compatibilidades de una refacción
    @GetMapping("/refaccion/{idRefaccion}")
    public ResponseEntity<List<CompatibilidadResponse>> listarPorRefaccion(@PathVariable Integer idRefaccion) {
        return ResponseEntity.ok(compatibilidadService.listarPorRefaccion(idRefaccion));
    }

    // POST /api/compatibilidades → agregar compatibilidad
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CompatibilidadRequest request) {
        try {
            CompatibilidadResponse response = compatibilidadService.crear(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // DELETE /api/compatibilidades/{id} → eliminar compatibilidad
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            compatibilidadService.eliminar(id);
            return ResponseEntity.ok("{\"mensaje\": \"Compatibilidad eliminada correctamente\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
