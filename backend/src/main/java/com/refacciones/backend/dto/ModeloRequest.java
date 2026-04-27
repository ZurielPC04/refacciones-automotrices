package com.refacciones.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ModeloRequest {

    @NotNull(message = "El id de la marca es obligatorio")
    private Integer idMarca;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @NotNull(message = "El año de inicio es obligatorio")
    private Short anioInicio;

    private Short anioFin;
}
