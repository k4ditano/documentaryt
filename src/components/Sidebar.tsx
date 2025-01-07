import { FC, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Drawer,
  List,
  ListItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Description as PageIcon,
  MoreHoriz as MoreIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Task as TaskIcon,
  CalendarMonth as CalendarMonthIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
  DragStartEvent,
  useSensor, 
  useSensors, 
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../context/AuthContext';
import AISearch from './AISearch';

interface SidebarItem {
  id: string;
  title: string;
  type: 'page' | 'folder';
  parentId: string | null;
  originalId: string;
  position?: number;
}

interface SortableItemProps {
  id: string;
  type: 'page' | 'folder';
  title: string;
  parentId: string | null;
  originalId: string;
  depth?: number;
  isExpanded?: boolean;
  isActive?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

interface SidebarProps {
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

const ItemContainer = styled('div')<{ depth?: number; isActive?: boolean }>(({ depth = 0, isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '2px 14px',
  paddingLeft: `${14 + depth * 12}px`,
  minHeight: '27px',
  cursor: 'pointer',
  color: 'rgb(55, 53, 47)',
  backgroundColor: isActive ? 'rgba(55, 53, 47, 0.08)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.05)',
  },
}));

const ItemTitle = styled('span')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '14px',
  marginLeft: '6px',
});

const SortableItem: FC<SortableItemProps> = ({
  id,
  type,
  title,
  depth = 0,
  isExpanded,
  isActive,
  onToggle,
  onClick,
  originalId,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newName, setNewName] = useState(title);
  const { updateFolder, deleteFolder, updatePage, deletePage } = useApp();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => {
    setIsRenaming(true);
    handleMenuClose();
  };

  const handleRenameClose = () => {
    setIsRenaming(false);
    setNewName(title);
  };

  const handleRenameConfirm = async () => {
    if (newName.trim() !== title) {
      try {
        if (type === 'folder') {
          await updateFolder(originalId, { name: newName.trim() });
        } else {
          await updatePage(originalId, { title: newName.trim() });
        }
        setIsRenaming(false);
      } catch (error) {
        console.error('Error al renombrar:', error);
      }
    }
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
    handleMenuClose();
  };

  const handleDeleteClose = () => {
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (type === 'folder') {
        await deleteFolder(originalId);
      } else {
        await deletePage(originalId);
      }
      setIsDeleting(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemContainer 
        depth={depth} 
        isActive={isActive} 
        onClick={onClick}
        sx={{
          borderRadius: '3px',
          ...(isDragging && {
            backgroundColor: 'rgba(55, 53, 47, 0.08)',
            boxShadow: '0 0 0 1px rgba(55, 53, 47, 0.16)',
          }),
        }}
      >
        {type === 'folder' ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            sx={{ p: 0.5 }}
          >
            {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        ) : (
          <PageIcon fontSize="small" sx={{ ml: 0.5 }} />
        )}
        <ItemTitle>{title}</ItemTitle>
        {!isDragging && (
          <>
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              sx={{ 
                opacity: {
                  xs: 1,
                  md: anchorEl ? 1 : 0
                }, 
                '&:hover': { opacity: 1 },
                padding: '2px',
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem onClick={handleRenameClick}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Renombrar
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Eliminar
              </MenuItem>
            </Menu>
            
            <Dialog 
              open={isRenaming} 
              onClose={handleRenameClose}
              onClick={(e) => e.stopPropagation()}
            >
              <DialogTitle>Renombrar {type === 'folder' ? 'carpeta' : 'página'}</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label={type === 'folder' ? 'Nombre de la carpeta' : 'Título de la página'}
                  type="text"
                  fullWidth
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  variant="outlined"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleRenameClose}>Cancelar</Button>
                <Button onClick={handleRenameConfirm} variant="contained" color="primary">
                  Guardar
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={isDeleting}
              onClose={handleDeleteClose}
              onClick={(e) => e.stopPropagation()}
            >
              <DialogTitle>Eliminar {type === 'folder' ? 'carpeta' : 'página'}</DialogTitle>
              <DialogContent>
                ¿Estás seguro de que quieres eliminar {type === 'folder' ? 'la carpeta' : 'la página'} "{title}"? Esta acción no se puede deshacer.
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteClose}>Cancelar</Button>
                <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                  Eliminar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </ItemContainer>
    </div>
  );
};

const LogoContainer = styled('div')({
  padding: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.03)',
  },
});

const Logo = styled('div')({
  fontSize: '14px',
  fontWeight: 500,
  color: 'rgb(55, 53, 47)',
});

const AddButton = styled(Button)({
  justifyContent: 'flex-start',
  textTransform: 'none',
  color: 'rgb(55, 53, 47)',
  padding: '3px 10px',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.05)',
  },
});

const ActionButton = styled(Button)({
  justifyContent: 'flex-start',
  textTransform: 'none',
  color: 'rgb(55, 53, 47)',
  padding: '3px 10px',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'rgba(55, 53, 47, 0.05)',
  },
});

const StyledList = styled(List)`
  padding: 8px 0;

  @media (max-width: 768px) {
    .MuiListItemText-primary {
      font-size: 16px !important;
      line-height: 24px;
    }

    .MuiListItemIcon-root {
      min-width: 48px;
      
      svg {
        width: 24px;
        height: 24px;
      }
    }

    .MuiListItem-root {
      padding: 12px 16px;
      min-height: 48px;
    }

    .MuiIconButton-root {
      padding: 12px;
    }

    .MuiCollapse-root .MuiListItem-root {
      padding-left: 32px;
    }

    .MuiSvgIcon-root {
      font-size: 24px;
    }

    .Mui-selected {
      background-color: rgba(55, 53, 47, 0.08) !important;
    }
  }
`;

const SidebarContent: FC<{ 
  isMobile?: boolean;
  onClose?: () => void;
  items: ReturnType<typeof useItems>;
  expandedFolders: Set<string>;
  activeItemId: string | null;
  onToggleFolder: (folderId: string) => void;
  onItemClick: (item: SidebarItem) => void;
  onNewPage: () => void;
  onNewFolder: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
}> = ({ 
  isMobile,
  onClose,
  items,
  expandedFolders,
  activeItemId,
  onToggleFolder,
  onItemClick,
  onNewPage,
  onNewFolder,
  onSettings,
  onLogout,
  onLogoClick
}) => {
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const renderItems = (currentItems: SidebarItem[], depth = 0) => {
    return currentItems.map(item => {
      const isExpanded = expandedFolders.has(item.id);
      const childItems = items.itemsByParent[item.id] || [];
      
      return (
        <Box key={item.id}>
          <SortableItem
            id={item.id}
            type={item.type}
            title={item.title}
            parentId={item.parentId}
            originalId={item.originalId}
            depth={depth}
            isExpanded={isExpanded}
            isActive={item.id === activeItemId}
            onToggle={() => onToggleFolder(item.id)}
            onClick={() => onItemClick(item)}
          />
          {isExpanded && childItems.length > 0 && renderItems(childItems, depth + 1)}
        </Box>
      );
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <LogoContainer onClick={onLogoClick}>
          <Logo>Documentary T.</Logo>
        </LogoContainer>
        
        <Box sx={{ px: 1, py: 2 }}>
          <AISearch />
        </Box>

        <Divider />
        
        <Box 
          sx={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          <SortableContext 
            items={items.rootItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <StyledList>
              {renderItems(items.rootItems)}
            </StyledList>
          </SortableContext>
        </Box>

        <Box 
          sx={{ 
            borderTop: '1px solid rgba(55, 53, 47, 0.09)',
            p: 1,
            backgroundColor: '#fbfbfa',
          }}
        >
          <AddButton
            fullWidth
            startIcon={<PageIcon sx={{ fontSize: 16 }} />}
            onClick={onNewPage}
          >
            Nueva página
          </AddButton>
          <AddButton
            fullWidth
            startIcon={<FolderIcon sx={{ fontSize: 16 }} />}
            onClick={onNewFolder}
          >
            Nueva carpeta
          </AddButton>
        </Box>

        <Box 
          sx={{
            p: 1,
            backgroundColor: '#fbfbfa',
          }}
        >
          <ActionButton
            fullWidth
            startIcon={<TaskIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/tasks')}
          >
            Tareas
          </ActionButton>
          <ActionButton
            fullWidth
            startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/calendar')}
          >
            Calendario
          </ActionButton>
        </Box>

        <Box 
          sx={{
            p: 1,
            backgroundColor: '#fbfbfa',
          }}
        >
          <ActionButton
            fullWidth
            startIcon={<NotificationsIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/reminders')}
          >
            Recordatorios
          </ActionButton>
          <ActionButton
            fullWidth
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            onClick={onLogout}
          >
            Cerrar sesión
          </ActionButton>
        </Box>

        <Divider />

        <Box
          sx={{
            p: 1,
            backgroundColor: '#fbfbfa',
          }}
        >
          <ActionButton
            fullWidth
            startIcon={<SettingsIcon sx={{ fontSize: 16 }} />}
            onClick={onSettings}
          >
            Ajustes
          </ActionButton>
          <ActionButton
            fullWidth
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            onClick={onLogout}
          >
            Cerrar sesión
          </ActionButton>
        </Box>
      </Box>
    </DndContext>
  );
};

const useItems = (pages: any[], folders: any[]) => {
  return useMemo(() => {
    const allItems = [
      ...pages.map((page) => ({
        id: `page-${page.id}`,
        title: page.title || 'Sin título',
        type: 'page' as const,
        parentId: page.parent_id,
        originalId: page.id,
        position: page.position || 0,
      })),
      ...folders.map((folder) => ({
        id: `folder-${folder.id}`,
        title: folder.name,
        type: 'folder' as const,
        parentId: folder.parent_id,
        originalId: folder.id,
        position: folder.position || 0,
      }))
    ];

    const rootItems = allItems.filter(item => !item.parentId);
    const itemsByParent = allItems.reduce((acc, item) => {
      if (item.parentId) {
        const parentId = `folder-${item.parentId}`;
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(item);
      }
      return acc;
    }, {} as Record<string, SidebarItem[]>);

    const sortItems = (items: SidebarItem[]) => {
      return items.sort((a, b) => (a.position || 0) - (b.position || 0));
    };

    return {
      rootItems: sortItems(rootItems),
      itemsByParent,
      allItems,
    };
  }, [pages, folders]);
};

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    width: 280px;
    background-color: #ffffff;
    border-right: 1px solid rgba(55, 53, 47, 0.09);

    @media (max-width: 768px) {
      width: 320px;
    }
  }
`;

const Sidebar: FC<SidebarProps> = ({ open = false, onClose }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pages, folders, createPage, createFolder } = useApp();
  const { logout } = useAuth();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const items = useItems(pages, folders);

  const handleDrawerToggle = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.type === 'folder') {
      toggleFolder(item.id);
    } else {
      setActiveItemId(item.id);
      navigate(`/page/${item.originalId}`);
    }
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleNewPage = async () => {
    try {
      const newPage = await createPage('Nueva página', null);
      if (newPage?.id) {
        navigate(`/page/${newPage.id}`);
      }
    } catch (error) {
      console.error('Error al crear nueva página:', error);
    }
    if (mobileOpen) handleDrawerToggle();
  };

  const handleNewFolder = async () => {
    try {
      const newFolder = await createFolder('Nueva carpeta', null);
      if (newFolder?.id) {
        const folderId = `folder-${newFolder.id}`;
        setExpandedFolders(prev => new Set([...prev, folderId]));
      }
    } catch (error) {
      console.error('Error al crear nueva carpeta:', error);
    }
    if (mobileOpen) handleDrawerToggle();
  };

  const handleLogoClick = () => {
    navigate('/');
    if (mobileOpen) handleDrawerToggle();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    if (mobileOpen) handleDrawerToggle();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const sidebarContent = (
    <StyledList>
      <SidebarContent
        items={items}
        expandedFolders={expandedFolders}
        activeItemId={activeItemId}
        onToggleFolder={toggleFolder}
        onItemClick={handleItemClick}
        onNewPage={handleNewPage}
        onNewFolder={handleNewFolder}
        onSettings={handleSettingsClick}
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
        onClose={handleDrawerToggle}
      />
    </StyledList>
  );

  return (
    <>
      <StyledDrawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        {sidebarContent}
      </StyledDrawer>
        
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            position: 'fixed',
          },
        }}
        open
      >
        {sidebarContent}
      </StyledDrawer>
    </>
  );
};

export default Sidebar; 