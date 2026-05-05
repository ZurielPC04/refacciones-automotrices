import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Si no hay usuario logueado, redirige al login
// Si requiere rol ADMIN y el usuario es EMPLEADO, redirige al dashboard
function PrivateRoute({ children, soloAdmin = false }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && usuario.rol !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PrivateRoute;
