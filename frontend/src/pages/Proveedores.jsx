import { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const formVacio = {
    nombre: '', contacto: '', telefono: '', email: '', direccion: '',
  };
  const [form, setForm] = useState(formVacio);
  const [confirm, setConfirm] = useState({ open: false, titulo: '', mensaje: '', labelConfirm: '', colorConfirm: 'error', onConfirm: null });
  const cerrarConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const cargarDatos = async () => {
    try {
      const res = await api.get('/proveedores');
      setProveedores(res.data);
    } catch {
      setError('Error al cargar proveedores');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(formVacio);
    setDialogOpen(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      contacto: p.contacto || '',
      telefono: p.telefono || '',
      email: p.email || '',
      direccion: p.direccion || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/proveedores/${editando.id}`, form);
      } else {
        await api.post('/proveedores', form);
      }
      setDialogOpen(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = (id, nombre) => {
    setConfirm({
      open: true, titulo: 'Desactivar proveedor',
      mensaje: `¿Desactivar "${nombre}"? Podrás reactivarlo desde esta misma pantalla.`,
      labelConfirm: 'Desactivar', colorConfirm: 'error',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.delete(`/proveedores/${id}`); cargarDatos(); }
        catch (err) { alert(err.response?.data?.error || 'Error'); }
      },
    });
  };

  const handleActivar = (id, nombre) => {
    setConfirm({
      open: true, titulo: 'Reactivar proveedor',
      mensaje: `¿Reactivar "${nombre}"?`,
      labelConfirm: 'Reactivar', colorConfirm: 'success',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.put(`/proveedores/${id}/activar`); cargarDatos(); }
        catch (err) { alert(err.response?.data?.error || 'Error'); }
      },
    });
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  if (cargando) return (
    <Box><Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  const activos = proveedores.filter(p => p.activo).length;

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>

        {/* Encabezado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalShippingIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Catálogo de Proveedores
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activos} activos · {proveedores.length - activos} inactivos
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
            Nuevo Proveedor
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {['Nombre', 'Contacto', 'Teléfono', 'Email', 'Dirección', 'Estado', 'Acciones'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {proveedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay proveedores registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  proveedores.map(p => (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{
                        backgroundColor: p.activo ? 'inherit' : '#f5f5f5',
                        opacity: p.activo ? 1 : 0.65,
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">{p.nombre}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{p.contacto || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">{p.telefono || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {p.email || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {p.direccion || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={p.activo ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {p.activo ? (
                          <>
                            <Tooltip title="Editar">
                              <IconButton size="small" color="primary" onClick={() => abrirEditar(p)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Desactivar">
                              <IconButton size="small" color="error" onClick={() => handleDesactivar(p.id, p.nombre)}>
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Activar">
                            <IconButton size="small" color="success" onClick={() => handleActivar(p.id, p.nombre)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <ConfirmDialog
          open={confirm.open} titulo={confirm.titulo} mensaje={confirm.mensaje}
          labelConfirm={confirm.labelConfirm} colorConfirm={confirm.colorConfirm}
          onConfirm={confirm.onConfirm} onCancel={cerrarConfirm}
        />

        {/* Dialog formulario */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre *"
                  value={form.nombre}
                  onChange={f('nombre')}
                  fullWidth
                  size="small"
                  required
                  inputProps={{ maxLength: 150 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Persona de Contacto"
                  value={form.contacto}
                  onChange={f('contacto')}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  value={form.telefono}
                  onChange={f('telefono')}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 20 }}
                  placeholder="55 1234 5678"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={f('email')}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 150 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  value={form.direccion}
                  onChange={f('direccion')}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={guardando || !form.nombre.trim()}
            >
              {guardando ? <CircularProgress size={20} /> : editando ? 'Guardar Cambios' : 'Crear Proveedor'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}

export default Proveedores;
