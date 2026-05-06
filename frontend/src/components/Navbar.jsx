import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box,
  Avatar, Menu, MenuItem, Divider, Chip,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard',   label: 'Dashboard',    icon: <DashboardIcon fontSize="small" /> },
  { to: '/inventario',  label: 'Inventario',   icon: <InventoryIcon fontSize="small" /> },
  { to: '/movimientos', label: 'Movimientos',  icon: <SwapHorizIcon fontSize="small" /> },
];

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const links = usuario?.rol === 'ADMIN'
    ? [...navLinks, { to: '/usuarios', label: 'Usuarios', icon: <PeopleIcon fontSize="small" /> }]
    : navLinks;

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main', boxShadow: 2 }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <BuildIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ mr: 3, fontSize: '1rem' }}>
          Refacciones Automotrices
        </Typography>

        {/* Links de navegación */}
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                startIcon={link.icon}
                sx={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>

        {/* Avatar + menú usuario */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={usuario?.rol}
            size="small"
            sx={{
              backgroundColor: usuario?.rol === 'ADMIN' ? '#e9c46a' : '#457b9d',
              color: usuario?.rol === 'ADMIN' ? '#333' : '#fff',
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          />
          <Avatar
            onClick={e => setAnchorEl(e.currentTarget)}
            sx={{ width: 34, height: 34, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#457b9d' }}
          >
            {iniciales}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">{usuario?.nombre}</Typography>
          </MenuItem>
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">{usuario?.email}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
            <Typography color="error">Cerrar sesión</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
