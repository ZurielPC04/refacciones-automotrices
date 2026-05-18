import { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';

function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [filtroMarca, setFiltroMarca] = useState('');

  const formVacio = { idMarca: '', nombre: '', anioInicio: '', anioFin: '' };
  const [form, setForm] = useState(formVacio);
  const [confirm, setConfirm] = useState({ open: false, titulo: '', mensaje: '', labelConfirm: '', colorConfirm: 'error', onConfirm: null });
  const cerrarConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const cargarDatos = async () => {
    try {
      const [modRes, marRes] = await Promise.all([
        api.get('/modelos'),
        api.get('/marcas'),
      ]);
      setModelos(modRes.data);
      setMarcas(marRes.data);
    } catch {
      setError('Error al cargar datos');
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

  const abrirEditar = (m) => {
    setEditando(m);
    setForm({
      idMarca: m.idMarca,
      nombre: m.nombre,
      anioInicio: m.anioInicio,
      anioFin: m.anioFin || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      const payload = {
        ...form,
        anioInicio: Number(form.anioInicio),
        anioFin: form.anioFin ? Number(form.anioFin) : null,
      };
      if (editando) {
        await api.put(`/modelos/${editando.id}`, payload);
      } else {
        await api.post('/modelos', payload);
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
      open: true, titulo: 'Desactivar modelo',
      mensaje: `¿Desactivar "${nombre}"? Podrás reactivarlo desde esta misma pantalla.`,
      labelConfirm: 'Desactivar', colorConfirm: 'error',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.delete(`/modelos/${id}`); cargarDatos(); }
        catch (err) { alert(err.response?.data?.error || 'Error'); }
      },
    });
  };

  const handleActivar = (id, nombre) => {
    setConfirm({
      open: true, titulo: 'Reactivar modelo',
      mensaje: `¿Reactivar "${nombre}"?`,
      labelConfirm: 'Reactivar', colorConfirm: 'success',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.put(`/modelos/${id}/activar`); cargarDatos(); }
        catch (err) { alert(err.response?.data?.error || 'Error'); }
      },
    });
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const modelosFiltrados = filtroMarca
    ? modelos.filter(m => m.idMarca === Number(filtroMarca))
    : modelos;

  if (cargando) return (
    <Box><Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  const activos = modelos.filter(m => m.activo).length;

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>

        {/* Encabezado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DirectionsCarIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Catálogo de Modelos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activos} activos · {modelos.length - activos} inactivos
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              label="Filtrar por marca"
              value={filtroMarca}
              onChange={e => setFiltroMarca(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todas las marcas</MenuItem>
              {marcas.filter(m => m.activo).map(m => (
                <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
              Nuevo Modelo
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {['Marca', 'Modelo', 'Año Inicio', 'Año Fin', 'Estado', 'Acciones'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {modelosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay modelos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  modelosFiltrados.map(m => (
                    <TableRow
                      key={m.id}
                      hover
                      sx={{
                        backgroundColor: m.activo ? 'inherit' : '#f5f5f5',
                        opacity: m.activo ? 1 : 0.65,
                      }}
                    >
                      <TableCell>
                        <Chip label={m.nombreMarca} size="small" variant="outlined" color="secondary" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">{m.nombre}</Typography>
                      </TableCell>
                      <TableCell>{m.anioInicio}</TableCell>
                      <TableCell>{m.anioFin || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={m.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={m.activo ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {m.activo ? (
                          <>
                            <Tooltip title="Editar">
                              <IconButton size="small" color="primary" onClick={() => abrirEditar(m)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Desactivar">
                              <IconButton size="small" color="error" onClick={() => handleDesactivar(m.id, m.nombre)}>
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Activar">
                            <IconButton size="small" color="success" onClick={() => handleActivar(m.id, m.nombre)}>
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
          <DialogTitle>{editando ? 'Editar Modelo' : 'Nuevo Modelo'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Marca *"
                  value={form.idMarca}
                  onChange={f('idMarca')}
                  fullWidth
                  size="small"
                  required
                >
                  {marcas.filter(m => m.activo).map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Nombre del Modelo *"
                  value={form.nombre}
                  onChange={f('nombre')}
                  fullWidth
                  size="small"
                  required
                  inputProps={{ maxLength: 100 }}
                  placeholder="Ej: Corolla, Civic, Ranger..."
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Año Inicio *"
                  type="number"
                  value={form.anioInicio}
                  onChange={f('anioInicio')}
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: 1900, max: 2030 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Año Fin"
                  type="number"
                  value={form.anioFin}
                  onChange={f('anioFin')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1900, max: 2030 }}
                  helperText="Dejar vacío si sigue vigente"
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
              disabled={guardando || !form.idMarca || !form.nombre.trim() || !form.anioInicio}
            >
              {guardando ? <CircularProgress size={20} /> : editando ? 'Guardar Cambios' : 'Crear Modelo'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}

export default Modelos;
