package com.refacciones.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResumenDTO {

    private Long totalRefacciones;
    private Long refaccionesBajoStock;
    private Long entradasHoy;
    private Long salidasHoy;
    private Long totalMovimientosHoy;
}
