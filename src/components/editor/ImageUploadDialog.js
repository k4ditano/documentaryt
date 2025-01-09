import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useState, useCallback } from 'react';
const ImageUploadDialog = ({ open, onClose, onImageUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const handleFileSelect = useCallback((event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);
    const handleUpload = useCallback(async () => {
        if (!selectedFile)
            return;
        setIsUploading(true);
        try {
            // Por ahora, solo usaremos una URL temporal con base64
            // En una implementación real, aquí subirías la imagen a un servidor
            onImageUpload(previewUrl);
            onClose();
        }
        catch (error) {
            console.error('Error al subir la imagen:', error);
        }
        finally {
            setIsUploading(false);
        }
    }, [selectedFile, previewUrl, onImageUpload, onClose]);
    const handleClose = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
    }, [onClose]);
    return (_jsxs(Dialog, { open: open, onClose: handleClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Subir imagen" }), _jsx(DialogContent, { children: _jsxs(Box, { sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                    }, children: [_jsx("input", { accept: "image/*", style: { display: 'none' }, id: "image-upload-input", type: "file", onChange: handleFileSelect }), _jsx("label", { htmlFor: "image-upload-input", children: _jsx(Button, { variant: "outlined", component: "span", startIcon: _jsx(CloudUploadIcon, {}), disabled: isUploading, children: "Seleccionar imagen" }) }), previewUrl && (_jsx(Box, { sx: {
                                width: '100%',
                                maxHeight: '300px',
                                overflow: 'hidden',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                            }, children: _jsx("img", { src: previewUrl, alt: "Vista previa", style: {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                } }) })), !selectedFile && (_jsx(Typography, { variant: "body2", color: "text.secondary", align: "center", children: "Selecciona una imagen para subirla" })), isUploading && (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(CircularProgress, { size: 20 }), _jsx(Typography, { variant: "body2", children: "Subiendo imagen..." })] }))] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleClose, disabled: isUploading, children: "Cancelar" }), _jsx(Button, { onClick: handleUpload, variant: "contained", disabled: !selectedFile || isUploading, children: "Subir" })] })] }));
};
export default ImageUploadDialog;
