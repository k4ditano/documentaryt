import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Breadcrumbs,
  Button,
} from '@mui/material';
import {
  Description as PageIcon,
  Folder as FolderIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const FolderContainer = styled('div')({
  padding: '40px 64px',
  maxWidth: '1200px',
  margin: '0 auto',
  flex: 1,
});

const FolderTitle = styled(Typography)({
  fontSize: '2rem',
  fontWeight: 600,
  color: 'rgb(55, 53, 47)',
  marginBottom: '2rem',
});

const StyledListItem = styled(ListItem)({
  borderRadius: '4px',
  marginBottom: '4px',
  padding: '8px 12px',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.04)',
  },
});

const ItemTitle = styled(Typography)({
  fontSize: '0.95rem',
  color: 'rgb(55, 53, 47)',
  fontWeight: 500,
});

const ItemDate = styled(Typography)({
  fontSize: '0.85rem',
  color: 'rgba(55, 53, 47, 0.65)',
});

const Section = styled(Box)({
  marginBottom: '48px',
});

const HeaderContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '2rem',
  gap: '16px',
});

const BackButton = styled(IconButton)({
  color: 'rgba(55, 53, 47, 0.65)',
  padding: '8px',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.08)',
  },
});

const BreadcrumbButton = styled(Button)({
  color: 'rgba(55, 53, 47, 0.65)',
  fontSize: '14px',
  textTransform: 'none',
  padding: '4px 8px',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.08)',
  },
});

const Folder: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { pages, folders } = useApp();

  const currentFolder = folders.find(folder => folder.id === id);
  const subFolders = folders.filter(folder => folder.parentId === id);
  const folderPages = pages.filter(page => page.parentId === id);

  const getBreadcrumbPath = (folderId: string): Array<{ id: string; name: string }> => {
    const path: Array<{ id: string; name: string }> = [];
    let currentId = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId || '';
      } else {
        break;
      }
    }
    
    return path;
  };

  const handleBack = () => {
    if (currentFolder?.parentId) {
      navigate(`/folder/${currentFolder.parentId}`);
    } else {
      navigate('/');
    }
  };

  const handlePageClick = (pageId: string) => {
    navigate(`/editor/${pageId}`);
  };

  const handleFolderClick = (folderId: string) => {
    navigate(`/folder/${folderId}`);
  };

  if (!currentFolder) {
    return (
      <FolderContainer>
        <Typography>Carpeta no encontrada</Typography>
      </FolderContainer>
    );
  }

  const breadcrumbPath = getBreadcrumbPath(currentFolder.id);

  return (
    <FolderContainer>
      <HeaderContainer>
        <BackButton onClick={handleBack}>
          <ArrowBackIcon />
        </BackButton>
        <Breadcrumbs 
          separator={<ChevronRightIcon sx={{ fontSize: 16, color: 'rgba(55, 53, 47, 0.45)' }} />}
          aria-label="breadcrumb"
        >
          <BreadcrumbButton onClick={() => navigate('/')}>
            Inicio
          </BreadcrumbButton>
          {breadcrumbPath.map((item, index) => (
            <BreadcrumbButton
              key={item.id}
              onClick={() => {
                if (index < breadcrumbPath.length - 1) {
                  navigate(`/folder/${item.id}`);
                }
              }}
              sx={{ 
                cursor: index < breadcrumbPath.length - 1 ? 'pointer' : 'default',
                color: index === breadcrumbPath.length - 1 ? 'rgb(55, 53, 47)' : undefined,
                fontWeight: index === breadcrumbPath.length - 1 ? 500 : undefined,
                '&:hover': {
                  backgroundColor: index < breadcrumbPath.length - 1 ? 'rgba(55, 53, 47, 0.08)' : 'transparent',
                }
              }}
            >
              {item.name}
            </BreadcrumbButton>
          ))}
        </Breadcrumbs>
      </HeaderContainer>

      <FolderTitle>{currentFolder.name}</FolderTitle>

      {subFolders.length > 0 && (
        <Section>
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(55, 53, 47, 0.65)' }}>
            Subcarpetas
          </Typography>
          <List>
            {subFolders.map((folder) => (
              <StyledListItem
                key={folder.id}
                onClick={() => handleFolderClick(folder.id)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <FolderIcon sx={{ color: 'rgba(55, 53, 47, 0.65)' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<ItemTitle>{folder.name}</ItemTitle>}
                />
                <IconButton size="small" sx={{ color: 'rgba(55, 53, 47, 0.45)' }}>
                  <ChevronRightIcon />
                </IconButton>
              </StyledListItem>
            ))}
          </List>
        </Section>
      )}

      {folderPages.length > 0 && (
        <Section>
          <Typography variant="h6" sx={{ mb: 2, color: 'rgba(55, 53, 47, 0.65)' }}>
            Páginas
          </Typography>
          <List>
            {folderPages.map((page) => (
              <StyledListItem
                key={page.id}
                onClick={() => handlePageClick(page.id)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <PageIcon sx={{ color: 'rgba(55, 53, 47, 0.65)' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<ItemTitle>{page.title || 'Sin título'}</ItemTitle>}
                  secondary={
                    <ItemDate>
                      {new Date(page.lastModified).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </ItemDate>
                  }
                />
                <IconButton size="small" sx={{ color: 'rgba(55, 53, 47, 0.45)' }}>
                  <ChevronRightIcon />
                </IconButton>
              </StyledListItem>
            ))}
          </List>
        </Section>
      )}

      {subFolders.length === 0 && folderPages.length === 0 && (
        <Typography sx={{ color: 'rgba(55, 53, 47, 0.65)', textAlign: 'center', mt: 4 }}>
          Esta carpeta está vacía
        </Typography>
      )}
    </FolderContainer>
  );
};

export default Folder; 