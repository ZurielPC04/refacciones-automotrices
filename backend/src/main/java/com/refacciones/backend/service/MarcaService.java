package com.refacciones.backend.service;

import com.refacciones.backend.dto.MarcaRequest;
import com.refacciones.backend.dto.MarcaResponse;
import com.refacciones.backend.model.Marca;
import com.refacciones.backend.repository.MarcaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarcaService {

    @Autowired
    private MarcaRepository marcaRepository;

    // Listar todas las marcas activas
    public List<MarcaResponse> listarTodas() {
        return marcaRepository.findByActivoTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Obtener una marca por id
    public MarcaResponse obtenerPorId(Integer id) {
        Marca marca = marcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada con id: " + id));
        return toResponse(marca);
    }

    // Crear nueva marca
    public MarcaResponse crear(MarcaRequest request) {
        // Verificar que no exista una marca con el mismo nombre
        if (marcaRepository.findByNombre(request.getNombre()).isPresent()) {
            throw new RuntimeException("Ya existe una marca con el nombre: " + request.getNombre());
        }

        Marca marca = new Marca();
        marca.setNombre(request.getNombre());
        marca.setPaisOrigen(request.getPaisOrigen());
        marca.setActivo(true);

        return toResponse(marcaRepository.save(marca));
    }

    // Actualizar marca existente
    public MarcaResponse actualizar(Integer id, MarcaRequest request) {
        Marca marca = marcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada con id: " + id));

        marca.setNombre(request.getNombre());
        marca.setPaisOrigen(request.getPaisOrigen());

        return toResponse(marcaRepository.save(marca));
    }

    // Eliminar marca (borrado lógico)
    public void eliminar(Integer id) {
        Marca marca = marcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada con id: " + id));
        marca.setActivo(false);
        marcaRepository.save(marca);
    }

    // Convertir Marca → MarcaResponse
    private MarcaResponse toResponse(Marca marca) {
        return new MarcaResponse(
                marca.getId(),
                marca.getNombre(),
                marca.getPaisOrigen(),
                marca.getActivo()
        );
    }
}
