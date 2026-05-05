import { createContext, useContext, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

// Proveedor: envuelve toda la app y comparte el usuario logueado
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // Llama al backend y guarda el usuario en el estado
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setUsuario(response.data);
    return response.data;
  };

  // Llama al backend para cerrar sesión y limpia el estado
  const logout = async () => {
    await api.post('/auth/logout');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto en cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}
