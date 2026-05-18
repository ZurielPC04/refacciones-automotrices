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
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';

function Inventario() {
  const [refacciones, setRefacciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, titulo: '', mensaje: '', labelConfirm: '', colorConfirm: 'error', onConfirm: null });
  const cerrarConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const formVacio = {
    nombre: '', numeroParte: '', descripcion: '',
    idCategoria: '', precioCompra: '', precioVenta: '',
    stockMinimo: '', unidadMedida: 'PIEZA', ubicacionAlmacen: '',
  };
  const [form, setForm] = useState(formVacio);

  const cargarDatos = async () => {
    try {
      const [refRes, catRes] = await Promise.all([
        api.get('/refacciones'),
        api.get('/categorias'),
      ]);
      setRefacciones(refRes.data);
      setCategorias(catRes.data);
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

  const abrirEditar = (r) => {
    setEditando(r);
    setForm({
      nombre: r.nombre,
      numeroParte: r.numeroParte || '',
      descripcion: r.descripcion || '',
      idCategoria: r.idCategoria,
      precioCompra: r.precioCompra,
      precioVenta: r.precioVenta,
      stockMinimo: r.stockMinimo,
      unidadMedida: r.unidadMedida || 'PIEZA',
      ubicacionAlmacen: r.ubicacionAlmacen || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/refacciones/${editando.id}`, form);
      } else {
        await api.post('/refacciones', form);
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
      open: true,
      titulo: 'Desactivar refacción',
      mensaje: `¿Desactivar "${nombre}"? Podrás reactivarla desde esta misma pantalla.`,
      labelConfirm: 'Desactivar',
      colorConfirm: 'error',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.delete(`/refacciones/${id}`); cargarDatos(); }
        catch (err) { alert(err.response?.data?.error || 'Error'); }
      },
    });
  };

  const handleActivar = (id, nombre) => {
    setConfirm({
      open: true,
      titulo: 'Reactivar refacción',
      mensaje: `¿Reactivar "${nombre}"?`,
      labelConfirm: 'Reactivar',
      colorConfirm: 'success',
      onConfirm: async () => {
        cerrarConfirm();
        try { await api.put(`/refacciones/${id}/activar`); cargarDatos(); }
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

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Inventario de Refacciones
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
            Nueva Refacción
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {['N° Parte', 'Nombre', 'Categoría', 'Stock', 'Stock Mín.', 'P. Venta', 'Unidad', 'Estado', 'Acciones']
                    .map(h => (
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {refacciones.map(r => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      backgroundColor: !r.activo
                        ? '#f5f5f5'
                        : r.bajoStock ? '#fff8f8' : 'inherit',
                      opacity: r.activo ? 1 : 0.65,
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                        {r.numeroParte || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">{r.nombre}</Typography>
                    </TableCell>
                    <TableCell>{r.nombreCategoria}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.stockActual}
                        size="small"
                        color={r.bajoStock ? 'error' : 'success'}
                        variant={r.bajoStock ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{r.stockMinimo}</TableCell>
                    <TableCell>${Number(r.precioVenta).toFixed(2)}</TableCell>
                    <TableCell>{r.unidadMedida}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={r.activo ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {r.activo ? (
                        <>
                          <Tooltip title="Editar">
                            <IconButton size="small" color="primary" onClick={() => abrirEditar(r)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Desactivar">
                            <IconButton size="small" color="error" onClick={() => handleDesactivar(r.id, r.nombre)}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Activar">
                          <IconButton size="small" color="success" onClick={() => handleActivar(r.id, r.nombre)}>
                            <CheckCircleIcon fontSize="small" />
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

        <ConfirmDialog
          open={confirm.open}
          titulo={confirm.titulo}
          mensaje={confirm.mensaje}
          labelConfirm={confirm.labelConfirm}
          colorConfirm={confirm.colorConfirm}
          onConfirm={confirm.onConfirm}
          onCancel={cerrarConfirm}
        />

        {/* Dialog: formulario */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editando ? 'Editar Refacción' : 'Nueva Refacción'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12} sm={8}>
                <TextField label="Nombre *" value={form.nombre} onChange={f('nombre')} fullWidth size="small" required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Número de Parte" value={form.numeroParte} onChange={f('numeroParte')} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Categoría *" value={form.idCategoria} onChange={f('idCategoria')} fullWidth size="small" required>
                  {categorias.filter(c => c.activo).map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Unidad de Medida" value={form.unidadMedida} onChange={f('unidadMedida')} fullWidth size="small">
                  {['PIEZA', 'LITRO', 'KG', 'METRO', 'JUEGO', 'PAR'].map(u => (
                    <MenuItem key={u} value={u}>{u}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Precio Compra *" type="number" value={form.precioCompra} onChange={f('precioCompra')} fullWidth size="small" required inputProps={{ step: '0.01', min: 0 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Precio Venta *" type="number" value={form.precioVenta} onChange={f('precioVenta')} fullWidth size="small" required inputProps={{ step: '0.01', min: 0 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Stock Mínimo *" type="number" value={form.stockMinimo} onChange={f('stockMinimo')} fullWidth size="small" required inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Ubicación en Almacén" value={form.ubicacionAlmacen} onChange={f('ubicacionAlmacen')} fullWidth size="small" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Descripción" value={form.descripcion} onChange={f('descripcion')} fullWidth size="small" multiline rows={2} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={guardando}>
              {guardando ? <CircularProgress size={20} /> : editando ? 'Guardar Cambios' : 'Crear Refacción'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Inventario;
