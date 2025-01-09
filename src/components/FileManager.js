import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Button, Box, } from '@mui/material';
import { CloudUpload as UploadIcon, ContentCopy as CopyIcon, Delete as DeleteIcon, Description as FileIcon, AttachFile as AttachIcon, } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
const StyledDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        borderRadius: '8px',
        boxShadow: 'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
    },
});
const StyledDialogTitle = styled(DialogTitle)({
    padding: '16px 24px',
    borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
    '& .MuiTypography-root': {
        fontSize: '1.1rem',
        fontWeight: 500,
        color: 'rgb(55, 53, 47)',
    },
});
const FilePreview = styled('img')({
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid rgba(55, 53, 47, 0.16)',
    backgroundColor: 'rgb(247, 247, 247)',
});
const StyledListItem = styled(ListItem)({
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '4px',
    backgroundColor: 'rgb(251, 251, 250)',
    border: '1px solid rgba(55, 53, 47, 0.09)',
    transition: 'background-color 100ms ease-in',
    '&:hover': {
        backgroundColor: 'rgb(247, 247, 247)',
    },
});
const ActionButton = styled(IconButton)({
    padding: '6px',
    '&:hover': {
        backgroundColor: 'rgba(55, 53, 47, 0.08)',
    },
});
const UploadButton = styled(Button)({
    color: 'rgb(55, 53, 47)',
    backgroundColor: 'rgb(251, 251, 250)',
    border: '1px solid rgba(55, 53, 47, 0.16)',
    boxShadow: 'none',
    textTransform: 'none',
    padding: '6px 12px',
    fontSize: '14px',
    '&:hover': {
        backgroundColor: 'rgb(247, 247, 247)',
        border: '1px solid rgba(55, 53, 47, 0.32)',
        boxShadow: 'none',
    },
});
const FileManager = ({ files, onUpload, onDelete, }) => {
    const [open, setOpen] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(null);
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        try {
            await onUpload(file);
        }
        catch (error) {
            console.error('Error al subir el archivo:', error);
        }
    };
    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx(Button, { variant: "text", startIcon: _jsx(AttachIcon, {}), onClick: () => setOpen(true), sx: {
                            color: 'rgba(55, 53, 47, 0.65)',
                            textTransform: 'none',
                            fontSize: '14px',
                            padding: '6px 8px',
                            minWidth: 'auto',
                            '&:hover': {
                                backgroundColor: 'rgba(55, 53, 47, 0.08)',
                            },
                        }, children: "Documentos adjuntos" }), _jsx(Typography, { sx: {
                            color: 'rgba(55, 53, 47, 0.5)',
                            fontSize: '14px',
                            fontWeight: 400,
                        }, children: files.length > 0 ? `· ${files.length}` : '' })] }), _jsxs(StyledDialog, { open: open, onClose: () => setOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(StyledDialogTitle, { children: _jsx(Typography, { component: "div", variant: "h6", children: "Archivos adjuntos" }) }), _jsxs(DialogContent, { sx: { p: 3 }, children: [_jsx(Box, { sx: { mb: 3 }, children: _jsx(UploadButton, { startIcon: _jsx(UploadIcon, {}), children: _jsxs("label", { style: { cursor: 'pointer', display: 'flex', alignItems: 'center' }, children: ["Subir archivo", _jsx(VisuallyHiddenInput, { type: "file", onChange: handleFileUpload, accept: "image/*,.pdf,.doc,.docx,.txt" })] }) }) }), _jsx(List, { sx: { p: 0 }, children: files.map((file) => (_jsx(StyledListItem, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', width: '100%', gap: 2 }, children: [file.type === 'image' ? (_jsx(FilePreview, { src: file.url, alt: file.name })) : (_jsx(FileIcon, { sx: { fontSize: 40, color: 'rgba(55, 53, 47, 0.65)' } })), _jsx(ListItemText, { primary: _jsx(Typography, { sx: {
                                                        color: 'rgb(55, 53, 47)',
                                                        fontWeight: 500,
                                                        fontSize: '0.95rem',
                                                        mb: 0.5
                                                    }, children: file.name }), secondary: _jsxs(Typography, { sx: {
                                                        color: 'rgba(55, 53, 47, 0.65)',
                                                        fontSize: '0.85rem'
                                                    }, children: [formatFileSize(file.size), " \u2022 ", new Date(file.uploadDate).toLocaleDateString()] }) }), _jsxs(ListItemSecondaryAction, { children: [_jsx(ActionButton, { onClick: () => handleCopyUrl(file.url), color: copiedUrl === file.url ? "success" : "default", size: "small", children: _jsx(CopyIcon, { fontSize: "small" }) }), _jsx(ActionButton, { onClick: () => onDelete(file.id), color: "default", size: "small", children: _jsx(DeleteIcon, { fontSize: "small" }) })] })] }) }, file.id))) }), files.length === 0 && (_jsx(Typography, { variant: "body2", sx: {
                                    color: 'rgba(55, 53, 47, 0.5)',
                                    textAlign: 'center',
                                    mt: 4,
                                    fontSize: '0.95rem'
                                }, children: "No hay archivos adjuntos" }))] })] })] }));
};
export default FileManager;
