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
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard',   label: 'Dashboard',   icon: <DashboardIcon fontSize="small" /> },
  { to: '/inventario',  label: 'Inventario',  icon: <InventoryIcon fontSize="small" /> },
  { to: '/movimientos', label: 'Movimientos', icon: <SwapHorizIcon fontSize="small" /> },
];

const catalogos = [
  { to: '/categorias', label: 'Categorías',  icon: <CategoryIcon fontSize="small" /> },
  { to: '/modelos',    label: 'Modelos',     icon: <DirectionsCarIcon fontSize="small" /> },
  { to: '/proveedores',label: 'Proveedores', icon: <LocalShippingIcon fontSize="small" /> },
];

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorUser, setAnchorUser] = useState(null);
  const [anchorCat, setAnchorCat] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const isAdmin = usuario?.rol === 'ADMIN';
  const enCatalogo = catalogos.some(c => location.pathname === c.to);

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main', boxShadow: 2 }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <BuildIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ mr: 3, fontSize: '1rem' }}>
          Refacciones Automotrices
        </Typography>

        {/* Links principales */}
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          {navLinks.map(link => {
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

          {/* Dropdown Catálogos — solo ADMIN */}
          {isAdmin && (
            <>
              <Button
                startIcon={<MenuBookIcon fontSize="small" />}
                endIcon={<ArrowDropDownIcon />}
                onClick={e => setAnchorCat(e.currentTarget)}
                sx={{
                  color: enCatalogo ? '#fff' : 'rgba(255,255,255,0.7)',
                  backgroundColor: enCatalogo ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Catálogos
              </Button>
              <Menu
                anchorEl={anchorCat}
                open={Boolean(anchorCat)}
                onClose={() => setAnchorCat(null)}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              >
                {catalogos.map(c => (
                  <MenuItem
                    key={c.to}
                    component={Link}
                    to={c.to}
                    onClick={() => setAnchorCat(null)}
                    selected={location.pathname === c.to}
                    sx={{ gap: 1 }}
                  >
                    {c.icon}
                    {c.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {/* Usuarios — solo ADMIN */}
          {isAdmin && (() => {
            const active = location.pathname === '/usuarios';
            return (
              <Button
                component={Link}
                to="/usuarios"
                startIcon={<PeopleIcon fontSize="small" />}
                sx={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Usuarios
              </Button>
            );
          })()}
        </Box>

        {/* Avatar + menú usuario */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={usuario?.rol}
            size="small"
            sx={{
              backgroundColor: isAdmin ? '#e9c46a' : '#457b9d',
              color: isAdmin ? '#333' : '#fff',
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          />
          <Avatar
            onClick={e => setAnchorUser(e.currentTarget)}
            sx={{ width: 34, height: 34, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#457b9d' }}
          >
            {iniciales}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorUser}
          open={Boolean(anchorUser)}
          onClose={() => setAnchorUser(null)}
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
