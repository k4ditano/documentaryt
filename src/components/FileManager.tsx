import { FC, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Box,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
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

interface FileType {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadDate: string;
  pageId: string;
}

interface FileManagerProps {
  files: FileType[];
  onUpload: (file: globalThis.File) => void;
  onDelete: (fileId: string) => void;
}

const FileManager: FC<FileManagerProps> = ({
  files,
  onUpload,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await onUpload(file);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Button
          variant="text"
          startIcon={<AttachIcon />}
          onClick={() => setOpen(true)}
          sx={{
            color: 'rgba(55, 53, 47, 0.65)',
            textTransform: 'none',
            fontSize: '14px',
            padding: '6px 8px',
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: 'rgba(55, 53, 47, 0.08)',
            },
          }}
        >
          Documentos adjuntos
        </Button>
        <Typography
          sx={{
            color: 'rgba(55, 53, 47, 0.5)',
            fontSize: '14px',
            fontWeight: 400,
          }}
        >
          {files.length > 0 ? `· ${files.length}` : ''}
        </Typography>
      </Box>

      <StyledDialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <StyledDialogTitle>
          <Typography component="div" variant="h6">Archivos adjuntos</Typography>
        </StyledDialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <UploadButton
              startIcon={<UploadIcon />}
            >
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                Subir archivo
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </label>
            </UploadButton>
          </Box>

          <List sx={{ p: 0 }}>
            {files.map((file) => (
              <StyledListItem key={file.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  {file.type === 'image' ? (
                    <FilePreview src={file.url} alt={file.name} />
                  ) : (
                    <FileIcon sx={{ fontSize: 40, color: 'rgba(55, 53, 47, 0.65)' }} />
                  )}
                  <ListItemText
                    primary={
                      <Typography sx={{ 
                        color: 'rgb(55, 53, 47)',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        mb: 0.5
                      }}>
                        {file.name}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ 
                        color: 'rgba(55, 53, 47, 0.65)',
                        fontSize: '0.85rem'
                      }}>
                        {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <ActionButton 
                      onClick={() => handleCopyUrl(file.url)}
                      color={copiedUrl === file.url ? "success" : "default"}
                      size="small"
                    >
                      <CopyIcon fontSize="small" />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => onDelete(file.id)}
                      color="default"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </ActionButton>
                  </ListItemSecondaryAction>
                </Box>
              </StyledListItem>
            ))}
          </List>

          {files.length === 0 && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(55, 53, 47, 0.5)',
                textAlign: 'center',
                mt: 4,
                fontSize: '0.95rem'
              }}
            >
              No hay archivos adjuntos
            </Typography>
          )}
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default FileManager; 