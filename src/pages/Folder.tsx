import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Description as PageIcon,
  Folder as FolderIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import type { Page, Folder } from '../types';
import Sidebar from '../components/Sidebar';

const FolderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pages, folders } = useApp();
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [childPages, setChildPages] = useState<Page[]>([]);
  const [childFolders, setChildFolders] = useState<Folder[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: 'page' | 'folder'; id: string } | null>(null);

  useEffect(() => {
    if (id) {
      const folder = folders.find(f => f.id === id);
      setCurrentFolder(folder || null);

      const pagesInFolder = pages.filter(p => p.parent_id === id);
      const foldersInFolder = folders.filter(f => f.parent_id === id);

      setChildPages(pagesInFolder);
      setChildFolders(foldersInFolder);
    }
  }, [id, pages, folders]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, type: 'page' | 'folder', itemId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedItem({ type, id: itemId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedItem(null);
  };

  const handleItemClick = (type: 'page' | 'folder', itemId: string) => {
    if (type === 'page') {
      navigate(`/page/${itemId}`);
    } else {
      navigate(`/folder/${itemId}`);
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs: Folder[] = [];
    let currentId = currentFolder?.parent_id;

    while (currentId) {
      const parent = folders.find(f => f.id === currentId);
      if (parent) {
        breadcrumbs.unshift(parent);
        currentId = parent.parent_id;
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          backgroundColor: 'background.default',
        }}
      >
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Inicio
          </Link>
          {getBreadcrumbs().map((folder) => (
            <Link
              key={folder.id}
              component="button"
              variant="body1"
              onClick={() => navigate(`/folder/${folder.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              {folder.name}
            </Link>
          ))}
          {currentFolder && (
            <Typography color="text.primary">{currentFolder.name}</Typography>
          )}
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          {currentFolder?.name || 'Carpeta no encontrada'}
        </Typography>

        <List>
          {childFolders.map((folder) => (
            <ListItem
              key={folder.id}
              button
              onClick={() => handleItemClick('folder', folder.id)}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuClick(e, 'folder', folder.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText
                primary={folder.name}
                secondary={`Última modificación: ${formatDate(folder.updated_at)}`}
              />
            </ListItem>
          ))}

          {childPages.map((page) => (
            <ListItem
              key={page.id}
              button
              onClick={() => handleItemClick('page', page.id)}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuClick(e, 'page', page.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <PageIcon />
              </ListItemIcon>
              <ListItemText
                primary={page.title}
                secondary={`Última modificación: ${formatDate(page.updated_at)}`}
              />
            </ListItem>
          ))}
        </List>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Renombrar</MenuItem>
          <MenuItem onClick={handleMenuClose}>Eliminar</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default FolderPage; 