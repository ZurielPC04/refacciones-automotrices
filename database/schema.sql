-- ============================================================
-- SISTEMA DE ADMINISTRACIÓN DE REFACCIONES AUTOMOTRICES
-- PostgreSQL
-- ============================================================

-- Eliminar tablas si existen (orden inverso por FK)
DROP TABLE IF EXISTS movimientos_inventario CASCADE;
DROP TABLE IF EXISTS refaccion_compatibilidad CASCADE;
DROP TABLE IF EXISTS refacciones CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS modelos CASCADE;
DROP TABLE IF EXISTS marcas CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================
-- TABLA: marcas
-- ============================================================
CREATE TABLE marcas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    pais_origen VARCHAR(100),
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: modelos
-- ============================================================
CREATE TABLE modelos (
    id          SERIAL PRIMARY KEY,
    id_marca    INTEGER NOT NULL REFERENCES marcas(id),
    nombre      VARCHAR(100) NOT NULL,
    anio_inicio SMALLINT NOT NULL,
    anio_fin    SMALLINT,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_marca, nombre, anio_inicio)
);

-- ============================================================
-- TABLA: categorias
-- ============================================================
CREATE TABLE categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: proveedores
-- ============================================================
CREATE TABLE proveedores (
    id         SERIAL PRIMARY KEY,
    nombre     VARCHAR(150) NOT NULL,
    contacto   VARCHAR(100),
    telefono   VARCHAR(20),
    email      VARCHAR(150),
    direccion  TEXT,
    activo     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    rol            VARCHAR(20) NOT NULL DEFAULT 'EMPLEADO'
                       CHECK (rol IN ('ADMIN', 'EMPLEADO')),
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: refacciones
-- ============================================================
CREATE TABLE refacciones (
    id                SERIAL PRIMARY KEY,
    nombre            VARCHAR(150) NOT NULL,
    descripcion       TEXT,
    numero_parte      VARCHAR(100) UNIQUE,
    id_categoria      INTEGER NOT NULL REFERENCES categorias(id),
    precio_compra     NUMERIC(10,2) NOT NULL CHECK (precio_compra >= 0),
    precio_venta      NUMERIC(10,2) NOT NULL CHECK (precio_venta >= 0),
    stock_actual      INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo      INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    unidad_medida     VARCHAR(30) NOT NULL DEFAULT 'PIEZA',
    ubicacion_almacen VARCHAR(50),
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: refaccion_compatibilidad
-- Una refacción puede ser compatible con varios modelos y años
-- ============================================================
CREATE TABLE refaccion_compatibilidad (
    id           SERIAL PRIMARY KEY,
    id_refaccion INTEGER NOT NULL REFERENCES refacciones(id),
    id_modelo    INTEGER NOT NULL REFERENCES modelos(id),
    anio_desde   SMALLINT NOT NULL,
    anio_hasta   SMALLINT,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_refaccion, id_modelo, anio_desde)
);

-- ============================================================
-- TABLA: movimientos_inventario
-- Registra cada entrada y salida de piezas
-- ============================================================
CREATE TABLE movimientos_inventario (
    id              SERIAL PRIMARY KEY,
    id_refaccion    INTEGER NOT NULL REFERENCES refacciones(id),
    tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    motivo          VARCHAR(30) NOT NULL
                        CHECK (motivo IN ('COMPRA', 'VENTA', 'REPARACION', 'AJUSTE', 'DEVOLUCION')),
    id_proveedor    INTEGER REFERENCES proveedores(id),
    id_usuario      INTEGER NOT NULL REFERENCES usuarios(id),
    notas           TEXT,
    fecha           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para consultas frecuentes
-- ============================================================
CREATE INDEX idx_refacciones_categoria   ON refacciones(id_categoria);
CREATE INDEX idx_refacciones_bajo_stock  ON refacciones(stock_actual, stock_minimo);
CREATE INDEX idx_movimientos_refaccion   ON movimientos_inventario(id_refaccion);
CREATE INDEX idx_movimientos_fecha       ON movimientos_inventario(fecha);
CREATE INDEX idx_modelos_marca           ON modelos(id_marca);
CREATE INDEX idx_compatibilidad_refaccion ON refaccion_compatibilidad(id_refaccion);
CREATE INDEX idx_compatibilidad_modelo    ON refaccion_compatibilidad(id_modelo);

-- ============================================================
-- FUNCIÓN: actualizar stock automáticamente al registrar
--           un movimiento de inventario
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'ENTRADA' THEN
        UPDATE refacciones
        SET stock_actual = stock_actual + NEW.cantidad
        WHERE id = NEW.id_refaccion;
    ELSIF NEW.tipo = 'SALIDA' THEN
        -- Verificar que hay suficiente stock
        IF (SELECT stock_actual FROM refacciones WHERE id = NEW.id_refaccion) < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para la refacción con id %', NEW.id_refaccion;
        END IF;
        UPDATE refacciones
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id = NEW.id_refaccion;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock
AFTER INSERT ON movimientos_inventario
FOR EACH ROW EXECUTE FUNCTION actualizar_stock();

-- ============================================================
-- VISTA: inventario_completo
-- Facilita la consulta del inventario con toda su información
-- ============================================================
CREATE OR REPLACE VIEW inventario_completo AS
SELECT
    r.id,
    r.nombre,
    r.numero_parte,
    r.descripcion,
    c.nombre          AS categoria,
    r.precio_compra,
    r.precio_venta,
    r.stock_actual,
    r.stock_minimo,
    r.unidad_medida,
    r.ubicacion_almacen,
    CASE WHEN r.stock_actual <= r.stock_minimo THEN TRUE ELSE FALSE END AS bajo_stock
FROM refacciones r
JOIN categorias c ON c.id = r.id_categoria
WHERE r.activo = TRUE;

-- ============================================================
-- VISTA: refacciones_bajo_stock
-- Lista únicamente las piezas que requieren reabastecimiento
-- ============================================================
CREATE OR REPLACE VIEW refacciones_bajo_stock AS
SELECT
    r.id,
    r.nombre,
    r.numero_parte,
    c.nombre   AS categoria,
    r.stock_actual,
    r.stock_minimo,
    (r.stock_minimo - r.stock_actual) AS cantidad_faltante
FROM refacciones r
JOIN categorias c ON c.id = r.id_categoria
WHERE r.activo = TRUE
  AND r.stock_actual <= r.stock_minimo
ORDER BY cantidad_faltante DESC;

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

-- Marcas
INSERT INTO marcas (nombre, pais_origen) VALUES
('Toyota',     'Japón'),
('Chevrolet',  'Estados Unidos'),
('Ford',       'Estados Unidos'),
('Honda',      'Japón'),
('Nissan',     'Japón'),
('Volkswagen', 'Alemania'),
('Hyundai',    'Corea del Sur');

-- Modelos
INSERT INTO modelos (id_marca, nombre, anio_inicio, anio_fin) VALUES
(1, 'Corolla',  2000, NULL),
(1, 'Camry',    2002, NULL),
(1, 'Hilux',    2005, NULL),
(2, 'Silverado',2003, NULL),
(2, 'Aveo',     2004, 2020),
(2, 'Trax',     2013, NULL),
(3, 'F-150',    2000, NULL),
(3, 'Ranger',   2006, NULL),
(4, 'Civic',    2001, NULL),
(4, 'CR-V',     2007, NULL),
(5, 'Sentra',   2000, NULL),
(5, 'Frontier', 2005, NULL),
(6, 'Jetta',    2000, NULL),
(6, 'Tiguan',   2010, NULL),
(7, 'Tucson',   2005, NULL);

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Motor',        'Piezas internas del motor: pistones, válvulas, juntas, bujías'),
('Frenos',       'Sistema de frenado: pastillas, discos, tambores, cilindros'),
('Suspensión',   'Amortiguadores, resortes, rótulas, bujes, terminales'),
('Transmisión',  'Embrague, flechas, diferencial, sincronizadores'),
('Eléctrico',    'Batería, alternador, motor de arranque, sensores, fusibles'),
('Enfriamiento', 'Radiador, bomba de agua, termostato, mangueras'),
('Dirección',    'Caja de dirección, cremallera, bomba hidráulica'),
('Escape',       'Catalizador, silenciador, tubo de escape'),
('Filtros',      'Filtros de aire, aceite, gasolina y habitáculo'),
('Carrocería',   'Faros, espejos, parabrisas, defensas');

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
('Autopartes García',  'Luis García',   '5551234567', 'garcia@autopartes.com',  'Av. Insurgentes 100, CDMX'),
('Distribuidora Norte', 'Ana López',    '8181234567', 'norte@distribuidora.com', 'Blvd. Díaz Ordaz 45, MTY'),
('Refacciones Omega',  'Carlos Ríos',   '3331234567', 'omega@refacciones.com',  'Av. Vallarta 200, GDL');

-- Usuario administrador
-- Contraseña de ejemplo: 'admin123' (en producción usar bcrypt desde el backend)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@refacciones.com', '$2a$10$examplehashplaceholder1234567890', 'ADMIN'),
('Empleado Uno',  'empleado@refacciones.com', '$2a$10$examplehashplaceholder0987654321', 'EMPLEADO');

-- Refacciones
INSERT INTO refacciones (nombre, descripcion, numero_parte, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo, unidad_medida, ubicacion_almacen) VALUES
('Pastillas de freno delanteras', 'Juego de 4 pastillas de freno delanteras',     'FRN-001', 2,  180.00,  350.00, 20, 5,  'JUEGO',  'A-01'),
('Disco de freno delantero',      'Disco ventilado delantero 280mm',               'FRN-002', 2,  320.00,  580.00, 12, 4,  'PIEZA',  'A-02'),
('Amortiguador delantero',        'Amortiguador hidráulico eje delantero',         'SUS-001', 3,  450.00,  850.00, 8,  4,  'PIEZA',  'B-01'),
('Rótula de suspensión',          'Rótula inferior de suspensión delantera',       'SUS-002', 3,  120.00,  240.00, 15, 5,  'PIEZA',  'B-02'),
('Bujías (juego x4)',             'Juego de 4 bujías de iridio',                   'MOT-001', 1,   95.00,  180.00, 30, 10, 'JUEGO',  'C-01'),
('Filtro de aceite',              'Filtro de aceite estándar',                     'FIL-001', 9,   45.00,   90.00, 50, 15, 'PIEZA',  'C-02'),
('Filtro de aire',                'Filtro de aire para admisión',                  'FIL-002', 9,   55.00,  110.00, 35, 10, 'PIEZA',  'C-03'),
('Correa de distribución',        'Correa dentada de distribución',                'MOT-002', 1,  210.00,  420.00, 10, 3,  'PIEZA',  'C-04'),
('Batería 12V 45Ah',              'Batería de 12 voltios 45 amperios/hora',        'ELE-001', 5,  650.00, 1100.00, 6,  3,  'PIEZA',  'D-01'),
('Alternador',                    'Alternador reconstruido 65A',                   'ELE-002', 5,  780.00, 1350.00, 4,  2,  'PIEZA',  'D-02'),
('Radiador de agua',              'Radiador aluminio doble paso',                  'ENF-001', 6,  850.00, 1500.00, 3,  2,  'PIEZA',  'E-01'),
('Bomba de agua',                 'Bomba de agua con empaque incluido',            'ENF-002', 6,  280.00,  520.00, 7,  3,  'PIEZA',  'E-02'),
('Termostato',                    'Termostato 82°C con empaque',                   'ENF-003', 6,   65.00,  130.00, 20, 5,  'PIEZA',  'E-03'),
('Kit de embrague',               'Kit completo: disco, prensilla y collarín',     'TRA-001', 4, 1200.00, 2100.00, 5,  2,  'KIT',    'F-01'),
('Catalizador universal',         'Convertidor catalítico universal',              'ESC-001', 8,  950.00, 1700.00, 3,  2,  'PIEZA',  'G-01');

-- Compatibilidades (ejemplos representativos)
INSERT INTO refaccion_compatibilidad (id_refaccion, id_modelo, anio_desde, anio_hasta) VALUES
-- Pastillas freno → Corolla, Civic, Sentra
(1, 1,  2010, NULL),
(1, 9,  2012, NULL),
(1, 11, 2014, NULL),
-- Disco freno → Corolla, Jetta
(2, 1,  2010, NULL),
(2, 13, 2011, NULL),
-- Amortiguador → Hilux, Ranger, Frontier
(3, 3,  2010, NULL),
(3, 8,  2010, NULL),
(3, 12, 2010, NULL),
-- Bujías → múltiples modelos
(5, 1,  2000, NULL),
(5, 9,  2001, NULL),
(5, 11, 2000, NULL),
(5, 13, 2000, NULL),
-- Filtro aceite → todos los modelos gasolina
(6, 1,  2000, NULL),
(6, 2,  2002, NULL),
(6, 9,  2001, NULL),
(6, 13, 2000, NULL);

-- Movimientos de inventario de ejemplo
-- (El trigger actualiza stock_actual automáticamente)

-- Primero reseteamos stock_actual a 0 para que el trigger lo construya
UPDATE refacciones SET stock_actual = 0;

-- Entradas iniciales de inventario
INSERT INTO movimientos_inventario (id_refaccion, tipo, cantidad, precio_unitario, motivo, id_proveedor, id_usuario, notas) VALUES
(1,  'ENTRADA', 20, 180.00, 'COMPRA', 1, 1, 'Compra inicial de inventario'),
(2,  'ENTRADA', 12, 320.00, 'COMPRA', 1, 1, 'Compra inicial de inventario'),
(3,  'ENTRADA', 10, 450.00, 'COMPRA', 2, 1, 'Compra inicial de inventario'),
(4,  'ENTRADA', 15, 120.00, 'COMPRA', 2, 1, 'Compra inicial de inventario'),
(5,  'ENTRADA', 30,  95.00, 'COMPRA', 1, 1, 'Compra inicial de inventario'),
(6,  'ENTRADA', 50,  45.00, 'COMPRA', 1, 1, 'Compra inicial de inventario'),
(7,  'ENTRADA', 35,  55.00, 'COMPRA', 1, 1, 'Compra inicial de inventario'),
(8,  'ENTRADA', 10, 210.00, 'COMPRA', 3, 1, 'Compra inicial de inventario'),
(9,  'ENTRADA',  6, 650.00, 'COMPRA', 3, 1, 'Compra inicial de inventario'),
(10, 'ENTRADA',  4, 780.00, 'COMPRA', 2, 1, 'Compra inicial de inventario'),
(11, 'ENTRADA',  3, 850.00, 'COMPRA', 2, 1, 'Compra inicial de inventario'),
(12, 'ENTRADA',  7, 280.00, 'COMPRA', 2, 1, 'Compra inicial de inventario'),
(13, 'ENTRADA', 20,  65.00, 'COMPRA', 1, 1, 'Compra inicial de inventario'),
(14, 'ENTRADA',  5,1200.00, 'COMPRA', 3, 1, 'Compra inicial de inventario'),
(15, 'ENTRADA',  3, 950.00, 'COMPRA', 3, 1, 'Compra inicial de inventario');

-- Algunas salidas (ventas y reparaciones)
INSERT INTO movimientos_inventario (id_refaccion, tipo, cantidad, precio_unitario, motivo, id_usuario, notas) VALUES
(1, 'SALIDA', 2, 350.00, 'VENTA',      2, 'Venta mostrador cliente externo'),
(5, 'SALIDA', 1, 180.00, 'REPARACION', 2, 'Servicio de afinación vehículo placas ABC-123'),
(6, 'SALIDA', 3,  90.00, 'VENTA',      2, 'Venta mostrador'),
(3, 'SALIDA', 2, 850.00, 'REPARACION', 2, 'Cambio de amortiguadores vehículo placas XYZ-456'),
(9, 'SALIDA', 1,1100.00, 'VENTA',      2, 'Venta de batería cliente externo');

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT 'Tablas creadas correctamente' AS status;
SELECT nombre, stock_actual, stock_minimo,
       CASE WHEN stock_actual <= stock_minimo THEN 'BAJO STOCK' ELSE 'OK' END AS estado_stock
FROM refacciones
ORDER BY nombre;
