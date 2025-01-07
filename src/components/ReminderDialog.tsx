import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 500,
    borderRadius: '8px'
  }
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  color: 'rgb(55, 53, 47)',
  borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
  '& .MuiIconButton-root': {
    color: 'rgb(55, 53, 47)',
    padding: '8px',
    '&:hover': {
      backgroundColor: 'rgba(55, 53, 47, 0.08)'
    }
  }
}));

interface ReminderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; message?: string; reminderTime: Date }) => void;
}

const ReminderDialog: React.FC<ReminderDialogProps> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [reminderTime, setReminderTime] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!reminderTime) {
      setError('La fecha y hora son obligatorias');
      return;
    }

    if (reminderTime < new Date()) {
      setError('La fecha debe ser futura');
      return;
    }

    onSubmit({
      title: title.trim(),
      message: message.trim(),
      reminderTime
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setMessage('');
    setReminderTime(new Date());
    setError(null);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} fullWidth>
      <DialogHeader>
        Crear Recordatorio
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogHeader>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Ej: Llamar al médico"
            error={error === 'El título es obligatorio'}
            helperText={error === 'El título es obligatorio' ? error : ''}
          />

          <TextField
            label="Mensaje (opcional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            placeholder="Añade detalles adicionales..."
          />

          <DateTimePicker
            label="Fecha y hora"
            value={reminderTime}
            onChange={(newValue) => setReminderTime(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
                error: error === 'La fecha debe ser futura',
                helperText: error === 'La fecha debe ser futura' ? error : ''
              }
            }}
          />

          {error && error !== 'El título es obligatorio' && error !== 'La fecha debe ser futura' && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: 'rgb(55, 53, 47)' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#2ecc71',
            '&:hover': {
              bgcolor: '#27ae60'
            }
          }}
        >
          Crear Recordatorio
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ReminderDialog;
