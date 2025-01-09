import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogTitle, DialogContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, } from '@mui/material';
import { HOTKEYS } from '../../utils/editorUtils';
const formatHotkey = (hotkey) => {
    return hotkey
        .replace('mod', window.navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
        .replace('+', ' + ')
        .toUpperCase();
};
const formatCommand = (command) => {
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
const KeyboardHelp = ({ open, onClose }) => {
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Atajos de Teclado" }), _jsx(DialogContent, { children: _jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Typography, { variant: "subtitle2", children: "Atajo" }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "subtitle2", children: "Acci\u00F3n" }) })] }) }), _jsx(TableBody, { children: shortcuts.map(({ hotkey, command }) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Typography, { variant: "body2", sx: {
                                                    fontFamily: 'monospace',
                                                    backgroundColor: 'action.hover',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    display: 'inline-block',
                                                }, children: formatHotkey(hotkey) }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", children: formatCommand(command) }) })] }, hotkey))) })] }) }) })] }));
};
export default KeyboardHelp;
