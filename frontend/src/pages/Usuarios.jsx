import { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Chip, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import PeopleIcon from '@mui/icons-material/People';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
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

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      await api.post('/usuarios', form);
      setDialogOpen(false);
      setForm({ nombre: '', email: '', password: '', rol: 'EMPLEADO' });
      cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Desactivar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  if (cargando) return (
    <Box><Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  const activos   = usuarios.filter(u => u.activo).length;
  const admins    = usuarios.filter(u => u.rol === 'ADMIN').length;
  const empleados = usuarios.filter(u => u.rol === 'EMPLEADO').length;

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Gestión de Usuarios
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Nuevo Usuario
          </Button>
        </Box>

        {/* Resumen rápido */}
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Usuarios activos', value: activos,   color: '#2a9d8f' },
            { label: 'Administradores', value: admins,    color: '#1a1a2e' },
            { label: 'Empleados',       value: empleados, color: '#457b9d' },
          ].map(item => (
            <Grid item xs={4} key={item.label}>
              <Card sx={{ textAlign: 'center', py: 2, borderTop: `3px solid ${item.color}` }}>
                <Typography variant="h4" fontWeight="bold" color={item.color}>{item.value}</Typography>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {['Nombre', 'Correo', 'Rol', 'Estado', 'Acciones'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map(u => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="500">{u.nombre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.rol}
                        size="small"
                        color={u.rol === 'ADMIN' ? 'warning' : 'default'}
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={u.activo ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {u.activo && (
                        <Tooltip title="Desactivar usuario">
                          <IconButton size="small" color="error" onClick={() => handleDesactivar(u.id)}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Nuevo Usuario</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12}>
                <TextField label="Nombre completo *" value={form.nombre} onChange={f('nombre')} fullWidth size="small" required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Correo electrónico *" type="email" value={form.email} onChange={f('email')} fullWidth size="small" required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Contraseña *" type="password" value={form.password} onChange={f('password')} fullWidth size="small" required />
              </Grid>
              <Grid item xs={12}>
                <TextField select label="Rol *" value={form.rol} onChange={f('rol')} fullWidth size="small">
                  <MenuItem value="EMPLEADO">EMPLEADO</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={guardando}>
              {guardando ? <CircularProgress size={20} /> : 'Crear Usuario'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Usuarios;
