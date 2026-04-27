package com.refacciones.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoResponse {

    private Integer id;
    private Integer idRefaccion;
    private String nombreRefaccion;
    private String tipo;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private String motivo;
    private Integer idProveedor;
    private String nombreProveedor;
    private Integer idUsuario;
    private String nombreUsuario;
    private String notas;
    private LocalDateTime fecha;
}
