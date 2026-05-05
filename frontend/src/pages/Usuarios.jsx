import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'EMPLEADO' });

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', form);
      setMostrarForm(false);
      setForm({ nombre: '', email: '', password: '', rol: 'EMPLEADO' });
      cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desactivar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      cargarUsuarios();
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
          <h2 style={styles.titulo}>Gestión de Usuarios</h2>
          <button onClick={() => setMostrarForm(true)} style={styles.btnPrimario}>
            + Nuevo Usuario
          </button>
        </div>

        {/* Modal */}
        {mostrarForm && (
          <div style={styles.modal}>
            <div style={styles.modalContenido}>
              <h3 style={styles.modalTitulo}>Nuevo Usuario</h3>
              <form onSubmit={handleSubmit} style={styles.form}>
                <Campo label="Nombre completo *">
                  <input style={styles.input} value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                </Campo>
                <Campo label="Correo electrónico *">
                  <input style={styles.input} type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </Campo>
                <Campo label="Contraseña *">
                  <input style={styles.input} type="password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required />
                </Campo>
                <Campo label="Rol *">
                  <select style={styles.input} value={form.rol}
                    onChange={e => setForm({ ...form, rol: e.target.value })}>
                    <option value="EMPLEADO">EMPLEADO</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </Campo>
                <div style={styles.botones}>
                  <button type="button" onClick={() => setMostrarForm(false)} style={styles.btnCancelar}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnPrimario}>Crear Usuario</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div style={styles.tablaContenedor}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                {['Nombre', 'Correo', 'Rol', 'Estado', 'Acciones'].map(h =>
                  <th key={h} style={styles.th}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.nombre}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={u.rol === 'ADMIN' ? styles.badgeAdmin : styles.badgeEmpleado}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={u.activo ? styles.badgeActivo : styles.badgeInactivo}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {u.activo && (
                      <button onClick={() => handleEliminar(u.id)} style={styles.btnEliminar}>
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
  contenido: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  encabezado: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titulo: { fontSize: '1.5rem', color: '#1a1a2e', margin: 0 },
  btnPrimario: { backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem' },
  btnCancelar: { backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem' },
  btnEliminar: { backgroundColor: '#e63946', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContenido: { backgroundColor: 'white', borderRadius: '8px', padding: '28px', width: '420px' },
  modalTitulo: { marginTop: 0, marginBottom: '20px', color: '#1a1a2e' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  botones: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  tablaContenedor: { backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', backgroundColor: '#1a1a2e', color: 'white', textAlign: 'left', fontSize: '0.8rem' },
  td: { padding: '10px 16px', borderBottom: '1px solid #eee', fontSize: '0.875rem' },
  badgeAdmin: { backgroundColor: '#cce5ff', color: '#004085', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  badgeEmpleado: { backgroundColor: '#e2e3e5', color: '#383d41', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  badgeActivo: { backgroundColor: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
  badgeInactivo: { backgroundColor: '#f8d7da', color: '#721c24', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' },
};

export default Usuarios;
