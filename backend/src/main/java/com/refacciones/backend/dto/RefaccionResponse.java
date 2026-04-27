package com.refacciones.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefaccionResponse {

    private Integer id;
    private String nombre;
    private String descripcion;
    private String numeroParte;
    private Integer idCategoria;
    private String nombreCategoria;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private Integer stockActual;
    private Integer stockMinimo;
    private Boolean bajoStock;
    private String unidadMedida;
    private String ubicacionAlmacen;
    private Boolean activo;
}
