package com.refacciones.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModeloResponse {

    private Integer id;
    private Integer idMarca;
    private String nombreMarca;
    private String nombre;
    private Short anioInicio;
    private Short anioFin;
    private Boolean activo;
}
