package com.refacciones.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarcaResponse {

    private Integer id;
    private String nombre;
    private String paisOrigen;
    private Boolean activo;
}
