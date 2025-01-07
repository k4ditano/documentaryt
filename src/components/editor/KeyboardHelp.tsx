import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { HOTKEYS } from '../../utils/editorUtils';

interface KeyboardHelpProps {
  open: boolean;
  onClose: () => void;
}

const formatHotkey = (hotkey: string) => {
  return hotkey
    .replace('mod', window.navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
    .replace('+', ' + ')
    .toUpperCase();
};

const formatCommand = (command: string) => {
  return command.charAt(0).toUpperCase() + command.slice(1);
};

const shortcuts = [
  ...Object.entries(HOTKEYS).map(([hotkey, command]) => ({
    hotkey,
    command,
  })),
  { hotkey: 'mod+z', command: 'Deshacer' },
  { hotkey: 'mod+shift+z', command: 'Rehacer' },
  { hotkey: 'mod+enter', command: 'Nueva línea' },
  { hotkey: 'tab', command: 'Indentar' },
  { hotkey: 'shift+tab', command: 'Reducir indentación' },
];

const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Atajos de Teclado</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2">Atajo</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Acción</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shortcuts.map(({ hotkey, command }) => (
                <TableRow key={hotkey}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        backgroundColor: 'action.hover',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block',
                      }}
                    >
                      {formatHotkey(hotkey)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatCommand(command)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardHelp; 