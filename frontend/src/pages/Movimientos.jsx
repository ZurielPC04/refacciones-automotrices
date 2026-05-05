import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

const MOTIVOS_ENTRADA = ['COMPRA', 'DEVOLUCION'];
const MOTIVOS_SALIDA  = ['VENTA', 'REPARACION', 'AJUSTE'];

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [refacciones, setRefacciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA'); // ENTRADA | SALIDA

  const [form, setForm] = useState({
    idRefaccion: '', cantidad: '', precioUnitario: '',
    motivo: '', idProveedor: '', notas: '',
  });

  const cargarDatos = async () => {
    try {
      const [movRes, refRes, provRes] = await Promise.all([
        api.get('/movimientos'),
        api.get('/refacciones'),
        api.get('/proveedores'),
      ]);
      setMovimientos(movRes.data);
      setRefacciones(refRes.data);
      setProveedores(provRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirForm = (tipo) => {
    setTipoMovimiento(tipo);
    setForm({ idRefaccion: '', cantidad: '', precioUnitario: '', motivo: '', idProveedor: '', notas: '' });
    setMostrarForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = tipoMovimiento === 'ENTRADA' ? '/movimientos/entrada' : '/movimientos/salida';
      await api.post(endpoint, {
        ...form,
        idRefaccion: Number(form.idRefaccion),
        cantidad: Number(form.cantidad),
        precioUnitario: Number(form.precioUnitario),
        idProveedor: form.idProveedor ? Number(form.idProveedor) : null,
      });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar movimiento');
    }
  };

  const motivosActuales = tipoMovimiento === 'ENTRADA' ? MOTIVOS_ENTRADA : MOTIVOS_SALIDA;

  if (cargando) return <div style={styles.cargando}>Cargando...</div>;

  return (
    <div>
      <Navbar />
      <div style={styles.contenido}>
        <div style={styles.encabezado}>
          <h2 style={styles.titulo}>Movimientos de Inventario</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => abrirForm('ENTRADA')} style={styles.btnEntrada}>
              + Registrar Entrada
            </button>
            <button onClick={() => abrirForm('SALIDA')} style={styles.btnSalida}>
              + Registrar Salida
            </button>
          </div>
        </div>

        {/* Modal */}
        {mostrarForm && (
          <div style={styles.modal}>
            <div style={styles.modalContenido}>
              <h3 style={{
                ...styles.modalTitulo,
                color: tipoMovimiento === 'ENTRADA' ? '#2a9d8f' : '#e63946',
              }}>
                {tipoMovimiento === 'ENTRADA' ? '📥 Nueva Entrada' : '📤 Nueva Salida'}
              </h3>
              <form onSubmit={handleSubmit} style={styles.form}>
                <Campo label="Refacción *">
                  <select style={styles.input} value={form.idRefaccion}
                    onChange={e => setForm({ ...form, idRefaccion: e.target.value })} required>
                    <option value="">Seleccionar pieza...</option>
                    {refacciones.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} — Stock: {r.stockActual}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo label="Motivo *">
                  <select style={styles.input} value={form.motivo}
                    onChange={e => setForm({ ...form, motivo: e.target.value })} required>
                    <option value="">Seleccionar motivo...</option>
                    {motivosActuales.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Campo>

                <Campo label="Cantidad *">
                  <input style={styles.input} type="number" min="1" value={form.cantidad}
                    onChange={e => setForm({ ...form, cantidad: e.target.value })} required />
                </Campo>

                <Campo label="Precio Unitario *">
                  <input style={styles.input} type="number" step="0.01" min="0" value={form.precioUnitario}
                    onChange={e => setForm({ ...form, precioUnitario: e.target.value })} required />
                </Campo>

                {/* Proveedor solo para ENTRADA con motivo COMPRA */}
                {tipoMovimiento === 'ENTRADA' && form.motivo === 'COMPRA' && (
                  <Campo label="Proveedor *">
                    <select style={styles.input} value={form.idProveedor}
                      onChange={e => setForm({ ...form, idProveedor: e.target.value })} required>
                      <option value="">Seleccionar proveedor...</option>
                      {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </Campo>
                )}

                <Campo label="Notas">
                  <input style={styles.input} value={form.notas}
                    onChange={e => setForm({ ...form, notas: e.target.value })}
                    placeholder="Opcional..." />
                </Campo>

                <div style={styles.botones}>
                  <button type="button" onClick={() => setMostrarForm(false)} style={styles.btnCancelar}>
                    Cancelar
                  </button>
                  <button type="submit" style={tipoMovimiento === 'ENTRADA' ? styles.btnEntrada : styles.btnSalida}>
                    Registrar {tipoMovimiento === 'ENTRADA' ? 'Entrada' : 'Salida'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla de movimientos */}
        <div style={styles.tablaContenedor}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                {['Fecha', 'Pieza', 'Tipo', 'Motivo', 'Cantidad', 'Precio Unit.', 'Proveedor', 'Usuario']
                  .map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td style={styles.td}>{new Date(m.fecha).toLocaleString('es-MX')}</td>
                  <td style={styles.td}>{m.nombreRefaccion}</td>
                  <td style={styles.td}>
                    <span style={m.tipo === 'ENTRADA' ? styles.badgeEntrada : styles.badgeSalida}>
                      {m.tipo}
                    </span>
                  </td>
                  <td style={styles.td}>{m.motivo}</td>
                  <td style={styles.td}>{m.cantidad}</td>
                  <td style={styles.td}>${Number(m.precioUnitario).toFixed(2)}</td>
                  <td style={styles.td}>{m.nombreProveedor || '—'}</td>
                  <td style={styles.td}>{m.nombreUsuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '0.8rem', color: '#555', fontWeight: '500' }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  cargando: { padding: '40px', textAlign: 'center' },
  contenido: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  encabezado: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titulo: { fontSize: '1.5rem', color: '#1a1a2e', margin: 0 },
  btnEntrada: { backgroundColor: '#2a9d8f', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem' },
  btnSalida: { backgroundColor: '#e63946', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContenido: { backgroundColor: 'white', borderRadius: '8px', padding: '28px', width: '500px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitulo: { marginTop: 0, marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  botones: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  btnCancelar: { backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem' },
  tablaContenedor: { backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', backgroundColor: '#1a1a2e', color: 'white', textAlign: 'left', fontSize: '0.8rem' },
  td: { padding: '10px 16px', borderBottom: '1px solid #eee', fontSize: '0.875rem' },
  badgeEntrada: { backgroundColor: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  badgeSalida: { backgroundColor: '#f8d7da', color: '#721c24', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
};

export default Movimientos;
