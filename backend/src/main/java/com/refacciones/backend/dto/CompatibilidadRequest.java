package com.refacciones.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompatibilidadRequest {

    @NotNull(message = "El id de la refacción es obligatorio")
    private Integer idRefaccion;

    @NotNull(message = "El id del modelo es obligatorio")
    private Integer idModelo;

    @NotNull(message = "El año desde es obligatorio")
    private Short anioDesde;

    private Short anioHasta;
}
