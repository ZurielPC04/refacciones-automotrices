import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

function Dashboard() {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [bajoStock, setBajoStock] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resumenRes, bajoStockRes, movimientosRes] = await Promise.all([
          // Solo ADMIN puede ver el resumen
          usuario?.rol === 'ADMIN' ? api.get('/dashboard/resumen') : Promise.resolve(null),
          api.get('/dashboard/bajo-stock'),
          api.get('/dashboard/movimientos-recientes'),
        ]);

        if (resumenRes) setResumen(resumenRes.data);
        setBajoStock(bajoStockRes.data);
        setMovimientos(movimientosRes.data);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [usuario]);

  if (cargando) return <div style={styles.cargando}>Cargando...</div>;

  return (
    <div>
      <Navbar />
      <div style={styles.contenido}>
        <h2 style={styles.titulo}>Dashboard</h2>

        {/* Tarjetas de resumen — solo para ADMIN */}
        {resumen && (
          <div style={styles.tarjetas}>
            <Tarjeta titulo="Total Refacciones" valor={resumen.totalRefacciones} color="#1a1a2e" />
            <Tarjeta titulo="Bajo Stock" valor={resumen.refaccionesBajoStock} color="#e63946" />
            <Tarjeta titulo="Entradas Hoy" valor={resumen.entradasHoy} color="#2a9d8f" />
            <Tarjeta titulo="Salidas Hoy" valor={resumen.salidasHoy} color="#e9c46a" />
            <Tarjeta titulo="Movimientos Hoy" valor={resumen.totalMovimientosHoy} color="#457b9d" />
          </div>
        )}

        <div style={styles.columnas}>
          {/* Tabla de bajo stock */}
          <div style={styles.seccion}>
            <h3 style={styles.tituloSeccion}>⚠️ Piezas con Bajo Stock</h3>
            {bajoStock.length === 0 ? (
              <p style={styles.vacio}>No hay piezas con bajo stock.</p>
            ) : (
              <table style={styles.tabla}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {bajoStock.map((r) => (
                    <tr key={r.id}>
                      <td style={styles.td}>{r.nombre}</td>
                      <td style={styles.td}>{r.codigoProducto}</td>
                      <td style={{ ...styles.td, color: '#e63946', fontWeight: 'bold' }}>
                        {r.stockActual}
                      </td>
                      <td style={styles.td}>{r.stockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Últimos movimientos */}
          <div style={styles.seccion}>
            <h3 style={styles.tituloSeccion}>🕐 Últimos Movimientos</h3>
            {movimientos.length === 0 ? (
              <p style={styles.vacio}>No hay movimientos registrados.</p>
            ) : (
              <table style={styles.tabla}>
                <thead>
                  <tr>
                    <th style={styles.th}>Pieza</th>
                    <th style={styles.th}>Tipo</th>
                    <th style={styles.th}>Cant.</th>
                    <th style={styles.th}>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id}>
                      <td style={styles.td}>{m.nombreRefaccion}</td>
                      <td style={{
                        ...styles.td,
                        color: m.tipo === 'ENTRADA' ? '#2a9d8f' : '#e63946',
                        fontWeight: 'bold',
                      }}>
                        {m.tipo}
                      </td>
                      <td style={styles.td}>{m.cantidad}</td>
                      <td style={styles.td}>{m.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tarjeta({ titulo, valor, color }) {
  return (
    <div style={{ ...styles.tarjeta, backgroundColor: color }}>
      <p style={styles.tarjetaTitulo}>{titulo}</p>
      <p style={styles.tarjetaValor}>{valor}</p>
    </div>
  );
}

const styles = {
  cargando: { padding: '40px', textAlign: 'center', fontSize: '1.2rem' },
  contenido: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  titulo: { fontSize: '1.5rem', marginBottom: '20px', color: '#1a1a2e' },
  tarjetas: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
  tarjeta: {
    borderRadius: '8px', padding: '20px 28px', color: 'white',
    minWidth: '160px', flex: '1',
  },
  tarjetaTitulo: { margin: '0 0 8px 0', fontSize: '0.85rem', opacity: 0.85 },
  tarjetaValor: { margin: 0, fontSize: '2rem', fontWeight: 'bold' },
  columnas: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  seccion: {
    flex: '1', minWidth: '300px', backgroundColor: 'white',
    borderRadius: '8px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
  },
  tituloSeccion: { marginTop: 0, marginBottom: '16px', fontSize: '1rem', color: '#333' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '8px 12px', backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #eee', fontSize: '0.8rem', color: '#666',
  },
  td: { padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: '0.875rem' },
  vacio: { color: '#999', fontStyle: 'italic' },
};

export default Dashboard;
