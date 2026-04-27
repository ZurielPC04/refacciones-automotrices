package com.refacciones.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MovimientoRequest {

    @NotNull(message = "La refacción es obligatoria")
    private Integer idRefaccion;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
    private BigDecimal precioUnitario;

    // COMPRA, VENTA, REPARACION, AJUSTE, DEVOLUCION
    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;

    // Solo obligatorio en entradas tipo COMPRA
    private Integer idProveedor;

    private String notas;
}
