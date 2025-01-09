import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { insertImage } from '../../utils/editorUtils';
const ImageDropzone = ({ editor }) => {
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const url = reader.result;
                if (typeof url === 'string') {
                    insertImage(editor, url);
                }
            });
            reader.readAsDataURL(file);
        });
    }, [editor]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
        },
        multiple: true,
    });
    return (_jsxs(Box, { ...getRootProps(), sx: {
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
            },
        }, children: [_jsx("input", { ...getInputProps() }), _jsx(CloudUploadIcon, { sx: { fontSize: 48, color: 'primary.main', mb: 2 } }), _jsx(Typography, { variant: "h6", gutterBottom: true, children: isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra y suelta imágenes aquí' }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "o haz clic para seleccionar archivos" }), _jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 1 }, children: "Formatos soportados: PNG, JPG, GIF, SVG" })] }));
};
export default ImageDropzone;
