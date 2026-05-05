package com.refacciones.backend.service;

import com.refacciones.backend.dto.MovimientoRequest;
import com.refacciones.backend.dto.MovimientoResponse;
import com.refacciones.backend.model.MovimientoInventario;
import com.refacciones.backend.model.Proveedor;
import com.refacciones.backend.model.Refaccion;
import com.refacciones.backend.model.Usuario;
import com.refacciones.backend.repository.MovimientoInventarioRepository;
import com.refacciones.backend.repository.ProveedorRepository;
import com.refacciones.backend.repository.RefaccionRepository;
import com.refacciones.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovimientoService {

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Autowired
    private RefaccionRepository refaccionRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Listar todos los movimientos
    public List<MovimientoResponse> listarTodos() {
        return movimientoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Obtener un movimiento por id
    public MovimientoResponse obtenerPorId(Integer id) {
        MovimientoInventario movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado con id: " + id));
        return toResponse(movimiento);
    }

    // Historial de movimientos de una refacción
    public List<MovimientoResponse> listarPorRefaccion(Integer idRefaccion) {
        return movimientoRepository.findByRefaccionIdOrderByFechaDesc(idRefaccion)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Registrar entrada (COMPRA o DEVOLUCION)
    public MovimientoResponse registrarEntrada(MovimientoRequest request, HttpSession session) {
        // Verificar que el motivo sea válido para entrada
        if (!request.getMotivo().equals("COMPRA") && !request.getMotivo().equals("DEVOLUCION")) {
            throw new RuntimeException("Motivo inválido para entrada. Use COMPRA o DEVOLUCION");
        }

        // Si es COMPRA debe tener proveedor
        if (request.getMotivo().equals("COMPRA") && request.getIdProveedor() == null) {
            throw new RuntimeException("Para una COMPRA es obligatorio indicar el proveedor");
        }

        return registrarMovimiento(request, "ENTRADA", session);
    }

    // Registrar salida (VENTA, REPARACION o AJUSTE)
    public MovimientoResponse registrarSalida(MovimientoRequest request, HttpSession session) {
        // Verificar que el motivo sea válido para salida
        if (!request.getMotivo().equals("VENTA") &&
            !request.getMotivo().equals("REPARACION") &&
            !request.getMotivo().equals("AJUSTE")) {
            throw new RuntimeException("Motivo inválido para salida. Use VENTA, REPARACION o AJUSTE");
        }

        return registrarMovimiento(request, "SALIDA", session);
    }

    // Método privado que registra el movimiento y actualiza el stock
    private MovimientoResponse registrarMovimiento(MovimientoRequest request,
                                                    String tipo,
                                                    HttpSession session) {
        // Obtener refacción
        Refaccion refaccion = refaccionRepository.findById(request.getIdRefaccion())
                .orElseThrow(() -> new RuntimeException("Refacción no encontrada con id: " + request.getIdRefaccion()));

        // Verificar stock suficiente para salidas
        if (tipo.equals("SALIDA") && refaccion.getStockActual() < request.getCantidad()) {
            throw new RuntimeException("Stock insuficiente. Stock actual: " + refaccion.getStockActual());
        }

        // Obtener usuario de la sesión
        Usuario usuario = (Usuario) session.getAttribute("usuario");

        // Obtener proveedor si aplica
        Proveedor proveedor = null;
        if (request.getIdProveedor() != null) {
            proveedor = proveedorRepository.findById(request.getIdProveedor())
                    .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con id: " + request.getIdProveedor()));
        }

        // Crear el movimiento
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setRefaccion(refaccion);
        movimiento.setTipo(tipo);
        movimiento.setCantidad(request.getCantidad());
        movimiento.setPrecioUnitario(request.getPrecioUnitario());
        movimiento.setMotivo(request.getMotivo());
        movimiento.setProveedor(proveedor);
        movimiento.setUsuario(usuario);
        movimiento.setNotas(request.getNotas());

        movimientoRepository.save(movimiento);

        // Actualizar stock manualmente (complemento al trigger de PostgreSQL)
        if (tipo.equals("ENTRADA")) {
            refaccion.setStockActual(refaccion.getStockActual() + request.getCantidad());
        } else {
            refaccion.setStockActual(refaccion.getStockActual() - request.getCantidad());
        }
        refaccionRepository.save(refaccion);

        return toResponse(movimiento);
    }

    // Convertir MovimientoInventario → MovimientoResponse
    private MovimientoResponse toResponse(MovimientoInventario movimiento) {
        return new MovimientoResponse(
                movimiento.getId(),
                movimiento.getRefaccion().getId(),
                movimiento.getRefaccion().getNombre(),
                movimiento.getTipo(),
                movimiento.getCantidad(),
                movimiento.getPrecioUnitario(),
                movimiento.getMotivo(),
                movimiento.getProveedor() != null ? movimiento.getProveedor().getId() : null,
                movimiento.getProveedor() != null ? movimiento.getProveedor().getNombre() : null,
                movimiento.getUsuario().getId(),
                movimiento.getUsuario().getNombre(),
                movimiento.getNotas(),
                movimiento.getFecha()
        );
    }
}
