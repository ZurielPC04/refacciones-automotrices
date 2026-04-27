package com.refacciones.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RefaccionRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder 150 caracteres")
    private String nombre;

    private String descripcion;

    @Size(max = 100, message = "El número de parte no puede exceder 100 caracteres")
    private String numeroParte;

    @NotNull(message = "La categoría es obligatoria")
    private Integer idCategoria;

    @NotNull(message = "El precio de compra es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio de compra no puede ser negativo")
    private BigDecimal precioCompra;

    @NotNull(message = "El precio de venta es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio de venta no puede ser negativo")
    private BigDecimal precioVenta;

    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo;

    @Size(max = 30, message = "La unidad de medida no puede exceder 30 caracteres")
    private String unidadMedida = "PIEZA";

    @Size(max = 50, message = "La ubicación no puede exceder 50 caracteres")
    private String ubicacionAlmacen;
}
