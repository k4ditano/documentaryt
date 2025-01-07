import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Button, Typography, Breadcrumbs } from '@mui/material';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

interface Page {
  id: string;
  title: string;
  parent_id: string | null;
  last_modified?: string;
}

const FolderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { folders, pages, setFolders, setPages } = useApp();

  const currentFolder = folders.find(folder => folder.id === id);
  const subFolders = folders.filter(folder => folder.parent_id === id);
  const folderPages = pages.filter(page => page.parent_id === id);

  const getBreadcrumbPath = (folderId: string): Array<{ id: string; name: string }> => {
    const path: Array<{ id: string; name: string }> = [];
    let currentId = folderId;

    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parent_id || '';
      } else {
        break;
      }
    }

    return path;
  };

  const handleBack = () => {
    if (currentFolder?.parent_id) {
      navigate(`/folder/${currentFolder.parent_id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div>
      <Button onClick={handleBack}>Volver</Button>
      
      <Breadcrumbs aria-label="breadcrumb">
        <Link to="/">Inicio</Link>
        {id && getBreadcrumbPath(id).map((item) => (
          <Link key={item.id} to={`/folder/${item.id}`}>
            {item.name}
          </Link>
        ))}
      </Breadcrumbs>

      <Typography variant="h4">
        {currentFolder ? currentFolder.name : 'Carpeta no encontrada'}
      </Typography>

      <List>
        {subFolders.map((folder) => (
          <ListItem key={folder.id}>
            <ListItemText
              primary={folder.name}
              onClick={() => navigate(`/folder/${folder.id}`)}
            />
          </ListItem>
        ))}

        {folderPages.map((page) => (
          <ListItem key={page.id}>
            <ListItemText
              primary={page.title}
              secondary={page.last_modified ? `Última modificación: ${page.last_modified}` : undefined}
              onClick={() => navigate(`/page/${page.id}`)}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default FolderView; 