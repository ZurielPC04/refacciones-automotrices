import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

function Inventario() {
  const [refacciones, setRefacciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const formVacio = {
    nombre: '', codigoProducto: '', descripcion: '',
    idCategoria: '', idMarca: '', precioCompra: '',
    precioVenta: '', stockActual: '', stockMinimo: '',
    ubicacion: '', activo: true,
  };
  const [form, setForm] = useState(formVacio);

  const cargarDatos = async () => {
    try {
      const [refRes, catRes, marcaRes] = await Promise.all([
        api.get('/refacciones'),
        api.get('/categorias'),
        api.get('/marcas'),
      ]);
      setRefacciones(refRes.data);
      setCategorias(catRes.data);
      setMarcas(marcaRes.data);
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
      nombre: r.nombre, codigoProducto: r.codigoProducto,
      descripcion: r.descripcion || '', idCategoria: r.idCategoria,
      idMarca: r.idMarca, precioCompra: r.precioCompra,
      precioVenta: r.precioVenta, stockActual: r.stockActual,
      stockMinimo: r.stockMinimo, ubicacion: r.ubicacion || '',
      activo: r.activo,
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

  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Desactivar esta refacción?')) return;
    try {
      await api.delete(`/refacciones/${id}`);
      cargarDatos();
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
                  {['Código', 'Nombre', 'Categoría', 'Marca', 'Stock', 'P. Venta', 'Estado', 'Acciones']
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
                    sx={{ backgroundColor: r.stockActual <= r.stockMinimo ? '#fff8f8' : 'inherit' }}
                  >
                    <TableCell><Typography variant="body2" fontFamily="monospace">{r.codigoProducto}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight="500">{r.nombre}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{r.nombreCategoria}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{r.nombreMarca}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        label={r.stockActual}
                        size="small"
                        color={r.stockActual <= r.stockMinimo ? 'error' : 'success'}
                        variant={r.stockActual <= r.stockMinimo ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>${Number(r.precioVenta).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={r.activo ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => abrirEditar(r)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {r.activo && (
                        <Tooltip title="Desactivar">
                          <IconButton size="small" color="error" onClick={() => handleDesactivar(r.id)}>
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

        {/* Dialog: formulario */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editando ? 'Editar Refacción' : 'Nueva Refacción'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nombre *" value={form.nombre} onChange={f('nombre')} fullWidth size="small" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Código de Producto *" value={form.codigoProducto} onChange={f('codigoProducto')} fullWidth size="small" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Categoría *" value={form.idCategoria} onChange={f('idCategoria')} fullWidth size="small" required>
                  {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Marca *" value={form.idMarca} onChange={f('idMarca')} fullWidth size="small" required>
                  {marcas.map(m => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Precio Compra *" type="number" value={form.precioCompra} onChange={f('precioCompra')} fullWidth size="small" required inputProps={{ step: '0.01', min: 0 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Precio Venta *" type="number" value={form.precioVenta} onChange={f('precioVenta')} fullWidth size="small" required inputProps={{ step: '0.01', min: 0 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Stock Actual *" type="number" value={form.stockActual} onChange={f('stockActual')} fullWidth size="small" required inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Stock Mínimo *" type="number" value={form.stockMinimo} onChange={f('stockMinimo')} fullWidth size="small" required inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Ubicación" value={form.ubicacion} onChange={f('ubicacion')} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Descripción" value={form.descripcion} onChange={f('descripcion')} fullWidth size="small" />
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
