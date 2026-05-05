import axios from 'axios';

// Instancia de axios apuntando al backend Spring Boot
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true, // envía la cookie de sesión en cada petición
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
