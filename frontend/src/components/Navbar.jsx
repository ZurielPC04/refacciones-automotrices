import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>🔧 Refacciones Automotrices</span>

      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/inventario" style={styles.link}>Inventario</Link>
        <Link to="/movimientos" style={styles.link}>Movimientos</Link>
        {/* Solo visible para ADMIN */}
        {usuario?.rol === 'ADMIN' && (
          <Link to="/usuarios" style={styles.link}>Usuarios</Link>
        )}
      </div>

      <div style={styles.usuario}>
        <span style={styles.nombreUsuario}>
          {usuario?.nombre} ({usuario?.rol})
        </span>
        <button onClick={handleLogout} style={styles.btnLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    color: 'white',
    padding: '12px 24px',
  },
  logo: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: '#a0c4ff',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  usuario: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  nombreUsuario: {
    fontSize: '0.85rem',
    color: '#ccc',
  },
  btnLogout: {
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};

export default Navbar;
