import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { CustomEditor } from '../../types/slate';
import { insertImage } from '../../utils/editorUtils';

interface ImageDropzoneProps {
  editor: CustomEditor;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ editor }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
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
    },
    [editor]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    },
    multiple: true,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
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
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra y suelta imágenes aquí'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        o haz clic para seleccionar archivos
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        Formatos soportados: PNG, JPG, GIF, SVG
      </Typography>
    </Box>
  );
};

export default ImageDropzone; 