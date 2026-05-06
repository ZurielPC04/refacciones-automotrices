import { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

const MOTIVOS_ENTRADA = ['COMPRA', 'DEVOLUCION'];
const MOTIVOS_SALIDA  = ['VENTA', 'REPARACION', 'AJUSTE'];

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [refacciones, setRefacciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA');
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    idRefaccion: '', cantidad: '', precioUnitario: '',
    motivo: '', idProveedor: '', notas: '',
  });

  const cargarDatos = async () => {
    try {
      const [movRes, refRes, provRes] = await Promise.all([
        api.get('/movimientos'),
        api.get('/refacciones'),
        api.get('/proveedores'),
      ]);
      setMovimientos(movRes.data);
      setRefacciones(refRes.data);
      setProveedores(provRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirForm = (tipo) => {
    setTipoMovimiento(tipo);
    setForm({ idRefaccion: '', cantidad: '', precioUnitario: '', motivo: '', idProveedor: '', notas: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setGuardando(true);
    try {
      const endpoint = tipoMovimiento === 'ENTRADA' ? '/movimientos/entrada' : '/movimientos/salida';
      await api.post(endpoint, {
        ...form,
        idRefaccion: Number(form.idRefaccion),
        cantidad: Number(form.cantidad),
        precioUnitario: Number(form.precioUnitario),
        idProveedor: form.idProveedor ? Number(form.idProveedor) : null,
      });
      setDialogOpen(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar movimiento');
    } finally {
      setGuardando(false);
    }
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const motivosActuales = tipoMovimiento === 'ENTRADA' ? MOTIVOS_ENTRADA : MOTIVOS_SALIDA;
  const esEntrada = tipoMovimiento === 'ENTRADA';

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
            Movimientos de Inventario
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<TrendingUpIcon />}
              onClick={() => abrirForm('ENTRADA')}
            >
              Registrar Entrada
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<TrendingDownIcon />}
              onClick={() => abrirForm('SALIDA')}
            >
              Registrar Salida
            </Button>
          </Box>
        </Box>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  {['Fecha', 'Pieza', 'Tipo', 'Motivo', 'Cantidad', 'Precio Unit.', 'Proveedor', 'Usuario']
                    .map(h => (
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.map(m => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(m.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell>{m.nombreRefaccion}</TableCell>
                    <TableCell>
                      <Chip
                        label={m.tipo}
                        size="small"
                        color={m.tipo === 'ENTRADA' ? 'success' : 'error'}
                        icon={m.tipo === 'ENTRADA' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{m.motivo}</TableCell>
                    <TableCell align="center">{m.cantidad}</TableCell>
                    <TableCell>${Number(m.precioUnitario).toFixed(2)}</TableCell>
                    <TableCell>{m.nombreProveedor || '—'}</TableCell>
                    <TableCell>{m.nombreUsuario}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: esEntrada ? 'success.main' : 'error.main' }}>
            {esEntrada ? '📥 Registrar Entrada' : '📤 Registrar Salida'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12}>
                <TextField select label="Refacción *" value={form.idRefaccion} onChange={f('idRefaccion')} fullWidth size="small" required>
                  {refacciones.map(r => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.nombre} — Stock: {r.stockActual}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField select label="Motivo *" value={form.motivo} onChange={f('motivo')} fullWidth size="small" required>
                  {motivosActuales.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Cantidad *" type="number" value={form.cantidad} onChange={f('cantidad')} fullWidth size="small" required inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Precio Unitario *" type="number" value={form.precioUnitario} onChange={f('precioUnitario')} fullWidth size="small" required inputProps={{ step: '0.01', min: 0 }} />
              </Grid>
              {esEntrada && form.motivo === 'COMPRA' && (
                <Grid item xs={12}>
                  <TextField select label="Proveedor *" value={form.idProveedor} onChange={f('idProveedor')} fullWidth size="small" required>
                    {proveedores.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField label="Notas" value={form.notas} onChange={f('notas')} fullWidth size="small" placeholder="Opcional..." />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">Cancelar</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color={esEntrada ? 'success' : 'error'}
              disabled={guardando}
              startIcon={esEntrada ? <TrendingUpIcon /> : <TrendingDownIcon />}
            >
              {guardando ? <CircularProgress size={20} /> : `Registrar ${esEntrada ? 'Entrada' : 'Salida'}`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Movimientos;
