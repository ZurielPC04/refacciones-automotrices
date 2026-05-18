import { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const formVacio = { nombre: '', descripcion: '' };
  const [form, setForm] = useState(formVacio);
  const [confirm, setConfirm] = useState({ open: false, titulo: '', mensaje: '', labelConfirm: '', colorConfirm: 'error', onConfirm: null });
  const cerrarConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const cargarDatos = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch {
      setError('Error al cargar categorías');
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

  const abrirEditar = (c) => {
    setEditando(c);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/categorias/${editando.id}`, form);
      } else {
        await api.post('/categorias', form);
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
      open: true, titulo: 'Desactivar categoría',
      mensaje: `¿Desactivar "${nombre}"? Podrás reactivarla desde esta misma pantalla.`,
      labelConfirm: 'Desactivar', colorConfirm: 'error',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.delete(`/categorias/${id}`); cargarDatos(); }
        catch (err) { alert(err.response?.data?.error || 'Error'); }
      },
    });
  };

  const handleActivar = (id, nombre) => {
    setConfirm({
      open: true, titulo: 'Reactivar categoría',
      mensaje: `¿Reactivar "${nombre}"?`,
      labelConfirm: 'Reactivar', colorConfirm: 'success',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.put(`/categorias/${id}/activar`); cargarDatos(); }
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

  const activas = categorias.filter(c => c.activo).length;

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>

        {/* Encabezado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CategoryIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Catálogo de Categorías
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activas} activas · {categorias.length - activas} inactivas
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
            Nueva Categoría
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {['ID', 'Nombre', 'Descripción', 'Estado', 'Acciones'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay categorías registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map(c => (
                    <TableRow
                      key={c.id}
                      hover
                      sx={{
                        backgroundColor: c.activo ? 'inherit' : '#f5f5f5',
                        opacity: c.activo ? 1 : 0.65,
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{c.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">{c.nombre}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {c.descripcion || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.activo ? 'Activa' : 'Inactiva'}
                          size="small"
                          color={c.activo ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {c.activo ? (
                          <>
                            <Tooltip title="Editar">
                              <IconButton size="small" color="primary" onClick={() => abrirEditar(c)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Desactivar">
                              <IconButton size="small" color="error" onClick={() => handleDesactivar(c.id, c.nombre)}>
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Activar">
                            <IconButton size="small" color="success" onClick={() => handleActivar(c.id, c.nombre)}>
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
          <DialogTitle>{editando ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
              <TextField
                label="Nombre *"
                value={form.nombre}
                onChange={f('nombre')}
                fullWidth
                size="small"
                required
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={f('descripcion')}
                fullWidth
                size="small"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={guardando || !form.nombre.trim()}>
              {guardando ? <CircularProgress size={20} /> : editando ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}

export default Categorias;
