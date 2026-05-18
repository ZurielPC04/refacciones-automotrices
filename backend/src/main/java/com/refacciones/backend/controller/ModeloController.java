package com.refacciones.backend.controller;

import com.refacciones.backend.dto.ModeloRequest;
import com.refacciones.backend.dto.ModeloResponse;
import com.refacciones.backend.service.ModeloService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modelos")
public class ModeloController {

    @Autowired
    private ModeloService modeloService;

    // GET /api/modelos → listar todos los modelos activos
    @GetMapping
    public ResponseEntity<List<ModeloResponse>> listarTodos() {
        return ResponseEntity.ok(modeloService.listarTodos());
    }

    // GET /api/modelos/{id} → obtener un modelo por id
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(modeloService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // GET /api/modelos/marca/{idMarca} → listar modelos de una marca
    @GetMapping("/marca/{idMarca}")
    public ResponseEntity<List<ModeloResponse>> listarPorMarca(@PathVariable Integer idMarca) {
        return ResponseEntity.ok(modeloService.listarPorMarca(idMarca));
    }

    // POST /api/modelos → crear nuevo modelo
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody ModeloRequest request) {
        try {
            ModeloResponse response = modeloService.crear(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // PUT /api/modelos/{id} → actualizar modelo
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @Valid @RequestBody ModeloRequest request) {
        try {
            return ResponseEntity.ok(modeloService.actualizar(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // DELETE /api/modelos/{id} → desactivar modelo (baja lógica)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            modeloService.eliminar(id);
            return ResponseEntity.ok("{\"mensaje\": \"Modelo desactivado correctamente\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // PUT /api/modelos/{id}/activar → reactivar modelo
    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activar(@PathVariable Integer id) {
        try {
            modeloService.activar(id);
            return ResponseEntity.ok("{\"mensaje\": \"Modelo activado correctamente\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
