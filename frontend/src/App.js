import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Movimientos from './pages/Movimientos';
import Usuarios from './pages/Usuarios';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas (requieren sesión) */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/inventario" element={
            <PrivateRoute><Inventario /></PrivateRoute>
          } />
          <Route path="/movimientos" element={
            <PrivateRoute><Movimientos /></PrivateRoute>
          } />

          {/* Ruta solo para ADMIN */}
          <Route path="/usuarios" element={
            <PrivateRoute soloAdmin={true}><Usuarios /></PrivateRoute>
          } />

          {/* Cualquier ruta desconocida → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
