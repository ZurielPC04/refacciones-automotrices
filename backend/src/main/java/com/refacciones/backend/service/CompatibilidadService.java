package com.refacciones.backend.service;

import com.refacciones.backend.dto.CompatibilidadRequest;
import com.refacciones.backend.dto.CompatibilidadResponse;
import com.refacciones.backend.model.Modelo;
import com.refacciones.backend.model.Refaccion;
import com.refacciones.backend.model.RefaccionCompatibilidad;
import com.refacciones.backend.repository.ModeloRepository;
import com.refacciones.backend.repository.RefaccionCompatibilidadRepository;
import com.refacciones.backend.repository.RefaccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompatibilidadService {

    @Autowired
    private RefaccionCompatibilidadRepository compatibilidadRepository;

    @Autowired
    private RefaccionRepository refaccionRepository;

    @Autowired
    private ModeloRepository modeloRepository;

    // Listar compatibilidades de una refacción
    public List<CompatibilidadResponse> listarPorRefaccion(Integer idRefaccion) {
        return compatibilidadRepository.findByRefaccionId(idRefaccion)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Agregar compatibilidad
    public CompatibilidadResponse crear(CompatibilidadRequest request) {
        // Verificar que exista la refacción
        Refaccion refaccion = refaccionRepository.findById(request.getIdRefaccion())
                .orElseThrow(() -> new RuntimeException("Refacción no encontrada con id: " + request.getIdRefaccion()));

        // Verificar que exista el modelo
        Modelo modelo = modeloRepository.findById(request.getIdModelo())
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado con id: " + request.getIdModelo()));

        // Verificar que no exista esa compatibilidad
        if (compatibilidadRepository.existsByRefaccionIdAndModeloIdAndAnioDesde(
                request.getIdRefaccion(), request.getIdModelo(), request.getAnioDesde())) {
            throw new RuntimeException("Ya existe esa compatibilidad para el año indicado");
        }

        RefaccionCompatibilidad compatibilidad = new RefaccionCompatibilidad();
        compatibilidad.setRefaccion(refaccion);
        compatibilidad.setModelo(modelo);
        compatibilidad.setAnioDesde(request.getAnioDesde());
        compatibilidad.setAnioHasta(request.getAnioHasta());

        return toResponse(compatibilidadRepository.save(compatibilidad));
    }

    // Eliminar compatibilidad
    public void eliminar(Integer id) {
        if (!compatibilidadRepository.existsById(id)) {
            throw new RuntimeException("Compatibilidad no encontrada con id: " + id);
        }
        compatibilidadRepository.deleteById(id);
    }

    // Convertir RefaccionCompatibilidad → CompatibilidadResponse
    private CompatibilidadResponse toResponse(RefaccionCompatibilidad comp) {
        return new CompatibilidadResponse(
                comp.getId(),
                comp.getRefaccion().getId(),
                comp.getRefaccion().getNombre(),
                comp.getModelo().getId(),
                comp.getModelo().getNombre(),
                comp.getModelo().getMarca().getNombre(),
                comp.getAnioDesde(),
                comp.getAnioHasta()
        );
    }
}
