package com.refacciones.backend.controller;

import com.refacciones.backend.dto.MarcaRequest;
import com.refacciones.backend.dto.MarcaResponse;
import com.refacciones.backend.service.MarcaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {

    @Autowired
    private MarcaService marcaService;

    // GET /api/marcas → listar todas las marcas
    @GetMapping
    public ResponseEntity<List<MarcaResponse>> listarTodas() {
        return ResponseEntity.ok(marcaService.listarTodas());
    }

    // GET /api/marcas/{id} → obtener una marca por id
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(marcaService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // POST /api/marcas → crear nueva marca
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody MarcaRequest request) {
        try {
            MarcaResponse response = marcaService.crear(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // PUT /api/marcas/{id} → actualizar marca
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @Valid @RequestBody MarcaRequest request) {
        try {
            return ResponseEntity.ok(marcaService.actualizar(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // DELETE /api/marcas/{id} → eliminar marca (borrado lógico)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            marcaService.eliminar(id);
            return ResponseEntity.ok("{\"mensaje\": \"Marca eliminada correctamente\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
