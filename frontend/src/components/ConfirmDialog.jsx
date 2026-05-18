import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Diálogo de confirmación reutilizable.
 *
 * Props:
 *   open          boolean
 *   titulo        string
 *   mensaje       string
 *   labelConfirm  string  (default "Confirmar")
 *   colorConfirm  string  (default "error")
 *   onConfirm     fn
 *   onCancel      fn
 */
function ConfirmDialog({
  open,
  titulo = '¿Estás seguro?',
  mensaje = 'Esta acción puede revertirse.',
  labelConfirm = 'Confirmar',
  colorConfirm = 'error',
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          {titulo}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {mensaje}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color={colorConfirm}>
          {labelConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
