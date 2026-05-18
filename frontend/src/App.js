import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Movimientos from './pages/Movimientos';
import Usuarios from './pages/Usuarios';
import Categorias from './pages/Categorias';
import Modelos from './pages/Modelos';
import Proveedores from './pages/Proveedores';

const theme = createTheme({
  palette: {
    primary:   { main: '#1a1a2e' },
    secondary: { main: '#457b9d' },
    error:     { main: '#e63946' },
    success:   { main: '#2a9d8f' },
    background:{ default: '#f0f2f5' },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: { borderRadius: 8 },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/inventario" element={<PrivateRoute><Inventario /></PrivateRoute>} />
            <Route path="/movimientos" element={<PrivateRoute><Movimientos /></PrivateRoute>} />
            <Route path="/usuarios"    element={<PrivateRoute soloAdmin={true}><Usuarios /></PrivateRoute>} />
            <Route path="/categorias"  element={<PrivateRoute soloAdmin={true}><Categorias /></PrivateRoute>} />
            <Route path="/modelos"     element={<PrivateRoute soloAdmin={true}><Modelos /></PrivateRoute>} />
            <Route path="/proveedores" element={<PrivateRoute soloAdmin={true}><Proveedores /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
