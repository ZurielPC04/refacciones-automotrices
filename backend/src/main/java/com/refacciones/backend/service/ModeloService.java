package com.refacciones.backend.service;

import com.refacciones.backend.dto.ModeloRequest;
import com.refacciones.backend.dto.ModeloResponse;
import com.refacciones.backend.model.Marca;
import com.refacciones.backend.model.Modelo;
import com.refacciones.backend.repository.MarcaRepository;
import com.refacciones.backend.repository.ModeloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModeloService {

    @Autowired
    private ModeloRepository modeloRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    // Listar todos los modelos activos
    public List<ModeloResponse> listarTodos() {
        return modeloRepository.findByActivoTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Listar modelos de una marca específica
    public List<ModeloResponse> listarPorMarca(Integer idMarca) {
        return modeloRepository.findByMarcaIdAndActivoTrue(idMarca)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Obtener un modelo por id
    public ModeloResponse obtenerPorId(Integer id) {
        Modelo modelo = modeloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado con id: " + id));
        return toResponse(modelo);
    }

    // Crear nuevo modelo
    public ModeloResponse crear(ModeloRequest request) {
        Marca marca = marcaRepository.findById(request.getIdMarca())
                .orElseThrow(() -> new RuntimeException("Marca no encontrada con id: " + request.getIdMarca()));

        Modelo modelo = new Modelo();
        modelo.setMarca(marca);
        modelo.setNombre(request.getNombre());
        modelo.setAnioInicio(request.getAnioInicio());
        modelo.setAnioFin(request.getAnioFin());
        modeloRepository.save(modelo);
        return toResponse(modelo);
    }

    // Actualizar modelo existente
    public ModeloResponse actualizar(Integer id, ModeloRequest request) {
        Modelo modelo = modeloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado con id: " + id));

        Marca marca = marcaRepository.findById(request.getIdMarca())
                .orElseThrow(() -> new RuntimeException("Marca no encontrada con id: " + request.getIdMarca()));

        modelo.setMarca(marca);
        modelo.setNombre(request.getNombre());
        modelo.setAnioInicio(request.getAnioInicio());
        modelo.setAnioFin(request.getAnioFin());
        modeloRepository.save(modelo);
        return toResponse(modelo);
    }

    // Desactivar modelo (baja lógica)
    public void eliminar(Integer id) {
        Modelo modelo = modeloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado con id: " + id));
        modelo.setActivo(false);
        modeloRepository.save(modelo);
    }

    // Convertir Modelo → ModeloResponse
    private ModeloResponse toResponse(Modelo modelo) {
        return new ModeloResponse(
                modelo.getId(),
                modelo.getMarca().getId(),
                modelo.getMarca().getNombre(),
                modelo.getNombre(),
                modelo.getAnioInicio(),
                modelo.getAnioFin(),
                modelo.getActivo()
        );
    }
}
