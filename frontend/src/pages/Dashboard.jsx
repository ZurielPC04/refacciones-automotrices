import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const COLORES_DONUT = ['#2a9d8f', '#e63946'];
const COLORES_BARRA = { ENTRADA: '#2a9d8f', SALIDA: '#e63946' };

function TarjetaMetrica({ titulo, valor, icono, color, subtitulo }) {
  return (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {titulo}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {valor ?? '—'}
            </Typography>
            {subtitulo && (
              <Typography variant="caption" color="text.secondary">{subtitulo}</Typography>
            )}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: '50%',
            backgroundColor: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icono}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [bajoStock, setBajoStock] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [bajoStockRes, movimientosRes] = await Promise.all([
          api.get('/dashboard/bajo-stock'),
          api.get('/dashboard/movimientos-recientes'),
        ]);

        if (usuario?.rol === 'ADMIN') {
          const resumenRes = await api.get('/dashboard/resumen');
          setResumen(resumenRes.data);
        }

        setBajoStock(bajoStockRes.data);
        setMovimientos(movimientosRes.data);
      } catch (err) {
        setError('Error al cargar el dashboard');
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [usuario]);

  // Datos para gráfica donut: stock ok vs bajo stock
  const datosDonut = resumen
    ? [
        { name: 'Stock normal', value: resumen.totalRefacciones - resumen.refaccionesBajoStock },
        { name: 'Bajo stock',   value: resumen.refaccionesBajoStock },
      ]
    : [];

  // Datos para gráfica de barras: entradas vs salidas del día
  const datosBarras = resumen
    ? [
        { nombre: 'Hoy', Entradas: resumen.entradasHoy, Salidas: resumen.salidasHoy },
      ]
    : [];

  // Conteo de motivos en movimientos recientes para barra horizontal
  const conteoPorMotivo = movimientos.reduce((acc, m) => {
    acc[m.motivo] = (acc[m.motivo] || 0) + 1;
    return acc;
  }, {});
  const datosMotivos = Object.entries(conteoPorMotivo).map(([motivo, cantidad]) => ({
    motivo, cantidad,
  }));

  if (cargando) {
    return (
      <Box>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={48} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
        <Typography variant="h5" fontWeight="bold" color="primary.main" mb={3}>
          Dashboard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* ── Tarjetas de métricas (solo ADMIN) ── */}
        {resumen && (
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <TarjetaMetrica
                titulo="Total Refacciones"
                valor={resumen.totalRefacciones}
                icono={<InventoryIcon sx={{ color: '#1a1a2e' }} />}
                color="#1a1a2e"
                subtitulo="piezas activas"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TarjetaMetrica
                titulo="Bajo Stock"
                valor={resumen.refaccionesBajoStock}
                icono={<WarningAmberIcon sx={{ color: '#e63946' }} />}
                color="#e63946"
                subtitulo="requieren atención"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TarjetaMetrica
                titulo="Entradas Hoy"
                valor={resumen.entradasHoy}
                icono={<TrendingUpIcon sx={{ color: '#2a9d8f' }} />}
                color="#2a9d8f"
                subtitulo="movimientos"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TarjetaMetrica
                titulo="Salidas Hoy"
                valor={resumen.salidasHoy}
                icono={<TrendingDownIcon sx={{ color: '#e9c46a' }} />}
                color="#e9c46a"
                subtitulo="movimientos"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TarjetaMetrica
                titulo="Total Movimientos"
                valor={resumen.totalMovimientosHoy}
                icono={<SwapHorizIcon sx={{ color: '#457b9d' }} />}
                color="#457b9d"
                subtitulo="hoy"
              />
            </Grid>
          </Grid>
        )}

        {/* ── Gráficas ── */}
        <Grid container spacing={2} mb={3}>

          {/* Donut: estado del stock */}
          {resumen && (
            <Grid item xs={12} md={4}>
              <Card sx={{ height: 300 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Estado del Inventario
                  </Typography>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={datosDonut}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {datosDonut.map((entry, index) => (
                          <Cell key={index} fill={COLORES_DONUT[index]} />
                        ))}
                      </Pie>
                      <ReTooltip formatter={(value) => [`${value} piezas`]} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Barras: entradas vs salidas del día */}
          {resumen && (
            <Grid item xs={12} md={4}>
              <Card sx={{ height: 300 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Movimientos del Día
                  </Typography>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={datosBarras} barSize={48}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="nombre" hide />
                      <YAxis allowDecimals={false} />
                      <ReTooltip />
                      <Legend iconType="circle" />
                      <Bar dataKey="Entradas" fill={COLORES_BARRA.ENTRADA} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Salidas"  fill={COLORES_BARRA.SALIDA}  radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Barras: movimientos recientes por motivo */}
          <Grid item xs={12} md={resumen ? 4 : 6}>
            <Card sx={{ height: 300 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Movimientos por Motivo (recientes)
                </Typography>
                {datosMotivos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" mt={4} textAlign="center">
                    Sin datos aún
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={datosMotivos} layout="vertical" barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="motivo" width={80} tick={{ fontSize: 11 }} />
                      <ReTooltip />
                      <Bar dataKey="cantidad" fill="#457b9d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Donut secundario: proporción de tipos de movimiento */}
          {movimientos.length > 0 && (
            <Grid item xs={12} md={resumen ? 12 : 6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Proporción Entradas / Salidas (recientes)
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Entradas', value: movimientos.filter(m => m.tipo === 'ENTRADA').length },
                          { name: 'Salidas',  value: movimientos.filter(m => m.tipo === 'SALIDA').length },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#2a9d8f" />
                        <Cell fill="#e63946" />
                      </Pie>
                      <ReTooltip formatter={(value) => [`${value} movimientos`]} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* ── Tablas inferiores ── */}
        <Grid container spacing={2}>
          {/* Bajo stock */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  ⚠️ Piezas con Bajo Stock
                </Typography>
                {bajoStock.length === 0 ? (
                  <Alert severity="success">Todo el inventario está en niveles normales.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold', backgroundColor: '#f5f5f5' } }}>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Código</TableCell>
                          <TableCell align="center">Stock</TableCell>
                          <TableCell align="center">Mínimo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bajoStock.map(r => (
                          <TableRow key={r.id} hover>
                            <TableCell>{r.nombre}</TableCell>
                            <TableCell>{r.codigoProducto}</TableCell>
                            <TableCell align="center">
                              <Chip label={r.stockActual} size="small" color="error" />
                            </TableCell>
                            <TableCell align="center">{r.stockMinimo}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Últimos movimientos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  🕐 Últimos Movimientos
                </Typography>
                {movimientos.length === 0 ? (
                  <Alert severity="info">No hay movimientos registrados.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold', backgroundColor: '#f5f5f5' } }}>
                          <TableCell>Pieza</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell align="center">Cant.</TableCell>
                          <TableCell>Motivo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {movimientos.map(m => (
                          <TableRow key={m.id} hover>
                            <TableCell>{m.nombreRefaccion}</TableCell>
                            <TableCell>
                              <Chip
                                label={m.tipo}
                                size="small"
                                color={m.tipo === 'ENTRADA' ? 'success' : 'error'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">{m.cantidad}</TableCell>
                            <TableCell>{m.motivo}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
