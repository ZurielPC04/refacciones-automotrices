package com.refacciones.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompatibilidadResponse {

    private Integer id;
    private Integer idRefaccion;
    private String nombreRefaccion;
    private Integer idModelo;
    private String nombreModelo;
    private String nombreMarca;
    private Short anioDesde;
    private Short anioHasta;
}
