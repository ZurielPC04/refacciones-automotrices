package com.refacciones.backend.service;

import com.refacciones.backend.dto.RefaccionRequest;
import com.refacciones.backend.dto.RefaccionResponse;
import com.refacciones.backend.model.Categoria;
import com.refacciones.backend.model.Refaccion;
import com.refacciones.backend.repository.CategoriaRepository;
import com.refacciones.backend.repository.RefaccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RefaccionService {

    @Autowired
    private RefaccionRepository refaccionRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Listar todo el inventario activo
    public List<RefaccionResponse> listarTodas() {
        return refaccionRepository.findByActivoTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Obtener una refacción por id
    public RefaccionResponse obtenerPorId(Integer id) {
        Refaccion refaccion = refaccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refacción no encontrada con id: " + id));
        return toResponse(refaccion);
    }

    // Listar refacciones por categoría
    public List<RefaccionResponse> listarPorCategoria(Integer idCategoria) {
        return refaccionRepository.findByCategoriaIdAndActivoTrue(idCategoria)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Listar refacciones con bajo stock
    public List<RefaccionResponse> listarBajoStock() {
        return refaccionRepository.findBajoStock()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Crear nueva refacción
    public RefaccionResponse crear(RefaccionRequest request) {
        // Verificar que no exista el número de parte
        if (request.getNumeroParte() != null &&
            refaccionRepository.existsByNumeroParte(request.getNumeroParte())) {
            throw new RuntimeException("Ya existe una refacción con el número de parte: " + request.getNumeroParte());
        }

        // Verificar que exista la categoría
        Categoria categoria = categoriaRepository.findById(request.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + request.getIdCategoria()));

        Refaccion refaccion = new Refaccion();
        refaccion.setNombre(request.getNombre());
        refaccion.setDescripcion(request.getDescripcion());
        refaccion.setNumeroParte(request.getNumeroParte());
        refaccion.setCategoria(categoria);
        refaccion.setPrecioCompra(request.getPrecioCompra());
        refaccion.setPrecioVenta(request.getPrecioVenta());
        refaccion.setStockActual(0);
        refaccion.setStockMinimo(request.getStockMinimo());
        refaccion.setUnidadMedida(request.getUnidadMedida() != null ? request.getUnidadMedida() : "PIEZA");
        refaccion.setUbicacionAlmacen(request.getUbicacionAlmacen());
        refaccion.setActivo(true);

        return toResponse(refaccionRepository.save(refaccion));
    }

    // Actualizar refacción
    public RefaccionResponse actualizar(Integer id, RefaccionRequest request) {
        Refaccion refaccion = refaccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refacción no encontrada con id: " + id));

        Categoria categoria = categoriaRepository.findById(request.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + request.getIdCategoria()));

        refaccion.setNombre(request.getNombre());
        refaccion.setDescripcion(request.getDescripcion());
        refaccion.setNumeroParte(request.getNumeroParte());
        refaccion.setCategoria(categoria);
        refaccion.setPrecioCompra(request.getPrecioCompra());
        refaccion.setPrecioVenta(request.getPrecioVenta());
        refaccion.setStockMinimo(request.getStockMinimo());
        refaccion.setUnidadMedida(request.getUnidadMedida());
        refaccion.setUbicacionAlmacen(request.getUbicacionAlmacen());

        return toResponse(refaccionRepository.save(refaccion));
    }

    // Eliminar refacción (borrado lógico)
    public void eliminar(Integer id) {
        Refaccion refaccion = refaccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refacción no encontrada con id: " + id));
        refaccion.setActivo(false);
        refaccionRepository.save(refaccion);
    }

    // Convertir Refaccion → RefaccionResponse
    public RefaccionResponse toResponse(Refaccion refaccion) {
        return new RefaccionResponse(
                refaccion.getId(),
                refaccion.getNombre(),
                refaccion.getDescripcion(),
                refaccion.getNumeroParte(),
                refaccion.getCategoria().getId(),
                refaccion.getCategoria().getNombre(),
                refaccion.getPrecioCompra(),
                refaccion.getPrecioVenta(),
                refaccion.getStockActual(),
                refaccion.getStockMinimo(),
                refaccion.getStockActual() <= refaccion.getStockMinimo(),
                refaccion.getUnidadMedida(),
                refaccion.getUbicacionAlmacen(),
                refaccion.getActivo()
        );
    }
}
