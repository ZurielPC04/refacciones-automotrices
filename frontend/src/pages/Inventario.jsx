import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

function Inventario() {
  const [refacciones, setRefacciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Estado del formulario
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null); // null = nuevo, objeto = editar
  const [form, setForm] = useState({
    nombre: '', codigoProducto: '', descripcion: '',
    idCategoria: '', idMarca: '', precioCompra: '',
    precioVenta: '', stockActual: '', stockMinimo: '',
    ubicacion: '', activo: true,
  });

  const cargarDatos = async () => {
    try {
      const [refRes, catRes, marcaRes] = await Promise.all([
        api.get('/refacciones'),
        api.get('/categorias'),
        api.get('/marcas'),
      ]);
      setRefacciones(refRes.data);
      setCategorias(catRes.data);
      setMarcas(marcaRes.data);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setForm({
      nombre: '', codigoProducto: '', descripcion: '',
      idCategoria: '', idMarca: '', precioCompra: '',
      precioVenta: '', stockActual: '', stockMinimo: '',
      ubicacion: '', activo: true,
    });
    setMostrarForm(true);
  };

  const abrirEditar = (r) => {
    setEditando(r);
    setForm({
      nombre: r.nombre,
      codigoProducto: r.codigoProducto,
      descripcion: r.descripcion || '',
      idCategoria: r.idCategoria,
      idMarca: r.idMarca,
      precioCompra: r.precioCompra,
      precioVenta: r.precioVenta,
      stockActual: r.stockActual,
      stockMinimo: r.stockMinimo,
      ubicacion: r.ubicacion || '',
      activo: r.activo,
    });
    setMostrarForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/refacciones/${editando.id}`, form);
      } else {
        await api.post('/refacciones', form);
      }
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desactivar esta refacción?')) return;
    try {
      await api.delete(`/refacciones/${id}`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  if (cargando) return <div style={styles.cargando}>Cargando...</div>;

  return (
    <div>
      <Navbar />
      <div style={styles.contenido}>
        <div style={styles.encabezado}>
          <h2 style={styles.titulo}>Inventario de Refacciones</h2>
          <button onClick={abrirNuevo} style={styles.btnPrimario}>
            + Nueva Refacción
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Modal formulario */}
        {mostrarForm && (
          <div style={styles.modal}>
            <div style={styles.modalContenido}>
              <h3 style={styles.modalTitulo}>
                {editando ? 'Editar Refacción' : 'Nueva Refacción'}
              </h3>
              <form onSubmit={handleSubmit} style={styles.grid}>
                <Campo label="Nombre *" >
                  <input style={styles.input} value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                </Campo>
                <Campo label="Código de Producto *">
                  <input style={styles.input} value={form.codigoProducto}
                    onChange={e => setForm({ ...form, codigoProducto: e.target.value })} required />
                </Campo>
                <Campo label="Categoría *">
                  <select style={styles.input} value={form.idCategoria}
                    onChange={e => setForm({ ...form, idCategoria: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </Campo>
                <Campo label="Marca *">
                  <select style={styles.input} value={form.idMarca}
                    onChange={e => setForm({ ...form, idMarca: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </Campo>
                <Campo label="Precio Compra *">
                  <input style={styles.input} type="number" step="0.01" value={form.precioCompra}
                    onChange={e => setForm({ ...form, precioCompra: e.target.value })} required />
                </Campo>
                <Campo label="Precio Venta *">
                  <input style={styles.input} type="number" step="0.01" value={form.precioVenta}
                    onChange={e => setForm({ ...form, precioVenta: e.target.value })} required />
                </Campo>
                <Campo label="Stock Actual *">
                  <input style={styles.input} type="number" value={form.stockActual}
                    onChange={e => setForm({ ...form, stockActual: e.target.value })} required />
                </Campo>
                <Campo label="Stock Mínimo *">
                  <input style={styles.input} type="number" value={form.stockMinimo}
                    onChange={e => setForm({ ...form, stockMinimo: e.target.value })} required />
                </Campo>
                <Campo label="Ubicación">
                  <input style={styles.input} value={form.ubicacion}
                    onChange={e => setForm({ ...form, ubicacion: e.target.value })} />
                </Campo>
                <Campo label="Descripción">
                  <input style={styles.input} value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                </Campo>

                <div style={styles.botones}>
                  <button type="button" onClick={() => setMostrarForm(false)} style={styles.btnSecundario}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnPrimario}>
                    {editando ? 'Guardar Cambios' : 'Crear Refacción'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla de refacciones */}
        <div style={styles.tablaContenedor}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                {['Código', 'Nombre', 'Categoría', 'Marca', 'Stock', 'P. Venta', 'Estado', 'Acciones']
                  .map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {refacciones.map((r) => (
                <tr key={r.id} style={r.stockActual <= r.stockMinimo ? styles.filaAlerta : {}}>
                  <td style={styles.td}>{r.codigoProducto}</td>
                  <td style={styles.td}>{r.nombre}</td>
                  <td style={styles.td}>{r.nombreCategoria}</td>
                  <td style={styles.td}>{r.nombreMarca}</td>
                  <td style={{
                    ...styles.td,
                    color: r.stockActual <= r.stockMinimo ? '#e63946' : '#2a9d8f',
                    fontWeight: 'bold',
                  }}>
                    {r.stockActual}
                  </td>
                  <td style={styles.td}>${Number(r.precioVenta).toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={r.activo ? styles.badgeActivo : styles.badgeInactivo}>
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => abrirEditar(r)} style={styles.btnEditar}>Editar</button>
                    {r.activo && (
                      <button onClick={() => handleEliminar(r.id)} style={styles.btnEliminar}>
                        Desactivar
                      </button>
                    )}
                  </td>
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
  error: { color: '#e63946', backgroundColor: '#fff0f0', padding: '10px', borderRadius: '4px' },
  btnPrimario: {
    backgroundColor: '#1a1a2e', color: 'white', border: 'none',
    borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem',
  },
  btnSecundario: {
    backgroundColor: '#eee', color: '#333', border: 'none',
    borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem',
  },
  modal: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalContenido: {
    backgroundColor: 'white', borderRadius: '8px', padding: '28px',
    width: '640px', maxHeight: '90vh', overflowY: 'auto',
  },
  modalTitulo: { marginTop: 0, marginBottom: '20px', color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  input: {
    padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '0.9rem', width: '100%', boxSizing: 'border-box',
  },
  botones: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  tablaContenedor: { backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', backgroundColor: '#1a1a2e', color: 'white', textAlign: 'left', fontSize: '0.8rem' },
  td: { padding: '10px 16px', borderBottom: '1px solid #eee', fontSize: '0.875rem' },
  filaAlerta: { backgroundColor: '#fff8f8' },
  badgeActivo: { backgroundColor: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  badgeInactivo: { backgroundColor: '#f8d7da', color: '#721c24', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  btnEditar: { backgroundColor: '#457b9d', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem' },
  btnEliminar: { backgroundColor: '#e63946', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' },
};

export default Inventario;
