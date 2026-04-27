package com.refacciones.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorResponse {

    private Integer id;
    private String nombre;
    private String contacto;
    private String telefono;
    private String email;
    private String direccion;
    private Boolean activo;
}
