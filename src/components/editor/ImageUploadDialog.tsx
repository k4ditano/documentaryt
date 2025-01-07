import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useState, useCallback } from 'react';

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onImageUpload: (imageUrl: string) => void;
}

const ImageUploadDialog: FC<ImageUploadDialogProps> = ({ open, onClose, onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Por ahora, solo usaremos una URL temporal con base64
      // En una implementación real, aquí subirías la imagen a un servidor
      onImageUpload(previewUrl!);
      onClose();
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, previewUrl, onImageUpload, onClose]);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Subir imagen</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 2,
          }}
        >
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload-input"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="image-upload-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={isUploading}
            >
              Seleccionar imagen
            </Button>
          </label>

          {previewUrl && (
            <Box
              sx={{
                width: '100%',
                maxHeight: '300px',
                overflow: 'hidden',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <img
                src={previewUrl}
                alt="Vista previa"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          {!selectedFile && (
            <Typography variant="body2" color="text.secondary" align="center">
              Selecciona una imagen para subirla
            </Typography>
          )}

          {isUploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Subiendo imagen...</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || isUploading}
        >
          Subir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog; 