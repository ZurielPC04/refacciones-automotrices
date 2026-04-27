package com.refacciones.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movimientos_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_refaccion", nullable = false)
    private Refaccion refaccion;

    // ENTRADA o SALIDA
    @Column(nullable = false, length = 10)
    private String tipo;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    // COMPRA, VENTA, REPARACION, AJUSTE, DEVOLUCION
    @Column(nullable = false, length = 30)
    private String motivo;

    @ManyToOne
    @JoinColumn(name = "id_proveedor")
    private Proveedor proveedor; // solo en entradas tipo COMPRA

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
}
