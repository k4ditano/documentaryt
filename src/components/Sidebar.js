import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Button, Menu, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Drawer, List, } from '@mui/material';
import { ChevronRight as ChevronRightIcon, ExpandMore as ExpandMoreIcon, Description as PageIcon, MoreHoriz as MoreIcon, Folder as FolderIcon, Edit as EditIcon, Delete as DeleteIcon, Settings as SettingsIcon, Logout as LogoutIcon, Task as TaskIcon, CalendarMonth as CalendarMonthIcon, Notifications as NotificationsIcon, } from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../context/AuthContext';
import AISearch from './AISearch';
const ItemContainer = styled('div')(({ depth = 0, isActive }) => ({
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
const SortableItem = ({ id, type, title, depth = 0, isExpanded, isActive, onToggle, onClick, originalId, }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [newName, setNewName] = useState(title);
    const { updateFolder, deleteFolder, updatePage, deletePage } = useApp();
    const handleMenuOpen = (event) => {
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
                }
                else {
                    await updatePage(originalId, { title: newName.trim() });
                }
                setIsRenaming(false);
            }
            catch (error) {
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
            }
            else {
                await deletePage(originalId);
            }
            setIsDeleting(false);
        }
        catch (error) {
            console.error('Error al eliminar:', error);
        }
    };
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
    };
    return (_jsx("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: _jsxs(ItemContainer, { depth: depth, isActive: isActive, onClick: onClick, sx: {
                borderRadius: '3px',
                ...(isDragging && {
                    backgroundColor: 'rgba(55, 53, 47, 0.08)',
                    boxShadow: '0 0 0 1px rgba(55, 53, 47, 0.16)',
                }),
            }, children: [type === 'folder' ? (_jsx(IconButton, { size: "small", onClick: (e) => {
                        e.stopPropagation();
                        onToggle?.();
                    }, sx: { p: 0.5 }, children: isExpanded ? _jsx(ExpandMoreIcon, { fontSize: "small" }) : _jsx(ChevronRightIcon, { fontSize: "small" }) })) : (_jsx(PageIcon, { fontSize: "small", sx: { ml: 0.5 } })), _jsx(ItemTitle, { children: title }), !isDragging && (_jsxs(_Fragment, { children: [_jsx(IconButton, { size: "small", onClick: handleMenuOpen, sx: {
                                opacity: {
                                    xs: 1,
                                    md: anchorEl ? 1 : 0
                                },
                                '&:hover': { opacity: 1 },
                                padding: '2px',
                            }, children: _jsx(MoreIcon, { fontSize: "small" }) }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, onClick: (e) => e.stopPropagation(), children: [_jsxs(MenuItem, { onClick: handleRenameClick, children: [_jsx(EditIcon, { fontSize: "small", sx: { mr: 1 } }), "Renombrar"] }), _jsxs(MenuItem, { onClick: handleDeleteClick, children: [_jsx(DeleteIcon, { fontSize: "small", sx: { mr: 1 } }), "Eliminar"] })] }), _jsxs(Dialog, { open: isRenaming, onClose: handleRenameClose, onClick: (e) => e.stopPropagation(), children: [_jsxs(DialogTitle, { children: ["Renombrar ", type === 'folder' ? 'carpeta' : 'página'] }), _jsx(DialogContent, { children: _jsx(TextField, { autoFocus: true, margin: "dense", label: type === 'folder' ? 'Nombre de la carpeta' : 'Título de la página', type: "text", fullWidth: true, value: newName, onChange: (e) => setNewName(e.target.value), variant: "outlined" }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleRenameClose, children: "Cancelar" }), _jsx(Button, { onClick: handleRenameConfirm, variant: "contained", color: "primary", children: "Guardar" })] })] }), _jsxs(Dialog, { open: isDeleting, onClose: handleDeleteClose, onClick: (e) => e.stopPropagation(), children: [_jsxs(DialogTitle, { children: ["Eliminar ", type === 'folder' ? 'carpeta' : 'página'] }), _jsxs(DialogContent, { children: ["\u00BFEst\u00E1s seguro de que quieres eliminar ", type === 'folder' ? 'la carpeta' : 'la página', " \"", title, "\"? Esta acci\u00F3n no se puede deshacer."] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleDeleteClose, children: "Cancelar" }), _jsx(Button, { onClick: handleDeleteConfirm, variant: "contained", color: "error", children: "Eliminar" })] })] })] }))] }) }));
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
const StyledList = styled(List) `
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
const SidebarContent = ({ isMobile, onClose, items, expandedFolders, activeItemId, onToggleFolder, onItemClick, onNewPage, onNewFolder, onSettings, onLogout, onLogoClick }) => {
    const navigate = useNavigate();
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }));
    const renderItems = (currentItems, depth = 0) => {
        return currentItems.map(item => {
            const isExpanded = expandedFolders.has(item.id);
            const childItems = items.itemsByParent[item.id] || [];
            return (_jsxs(Box, { children: [_jsx(SortableItem, { id: item.id, type: item.type, title: item.title, parentId: item.parentId, originalId: item.originalId, depth: depth, isExpanded: isExpanded, isActive: item.id === activeItemId, onToggle: () => onToggleFolder(item.id), onClick: () => onItemClick(item) }), isExpanded && childItems.length > 0 && renderItems(childItems, depth + 1)] }, item.id));
        });
    };
    return (_jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, children: _jsxs(Box, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsx(LogoContainer, { onClick: onLogoClick, children: _jsx(Logo, { children: "Documentary T." }) }), _jsx(Box, { sx: { px: 1, py: 2 }, children: _jsx(AISearch, {}) }), _jsx(Divider, {}), _jsx(Box, { sx: {
                        flex: 1,
                        overflow: 'auto',
                        minHeight: 0,
                    }, children: _jsx(SortableContext, { items: items.rootItems.map(item => item.id), strategy: verticalListSortingStrategy, children: _jsx(StyledList, { children: renderItems(items.rootItems) }) }) }), _jsxs(Box, { sx: {
                        borderTop: '1px solid rgba(55, 53, 47, 0.09)',
                        p: 1,
                        backgroundColor: '#fbfbfa',
                    }, children: [_jsx(AddButton, { fullWidth: true, startIcon: _jsx(PageIcon, { sx: { fontSize: 16 } }), onClick: onNewPage, children: "Nueva p\u00E1gina" }), _jsx(AddButton, { fullWidth: true, startIcon: _jsx(FolderIcon, { sx: { fontSize: 16 } }), onClick: onNewFolder, children: "Nueva carpeta" })] }), _jsxs(Box, { sx: {
                        p: 1,
                        backgroundColor: '#fbfbfa',
                    }, children: [_jsx(ActionButton, { fullWidth: true, startIcon: _jsx(TaskIcon, { sx: { fontSize: 16 } }), onClick: () => navigate('/tasks'), children: "Tareas" }), _jsx(ActionButton, { fullWidth: true, startIcon: _jsx(CalendarMonthIcon, { sx: { fontSize: 16 } }), onClick: () => navigate('/calendar'), children: "Calendario" })] }), _jsxs(Box, { sx: {
                        p: 1,
                        backgroundColor: '#fbfbfa',
                    }, children: [_jsx(ActionButton, { fullWidth: true, startIcon: _jsx(NotificationsIcon, { sx: { fontSize: 16 } }), onClick: () => navigate('/reminders'), children: "Recordatorios" }), _jsx(ActionButton, { fullWidth: true, startIcon: _jsx(LogoutIcon, { sx: { fontSize: 16 } }), onClick: onLogout, children: "Cerrar sesi\u00F3n" })] }), _jsx(Divider, {}), _jsxs(Box, { sx: {
                        p: 1,
                        backgroundColor: '#fbfbfa',
                    }, children: [_jsx(ActionButton, { fullWidth: true, startIcon: _jsx(SettingsIcon, { sx: { fontSize: 16 } }), onClick: onSettings, children: "Ajustes" }), _jsx(ActionButton, { fullWidth: true, startIcon: _jsx(LogoutIcon, { sx: { fontSize: 16 } }), onClick: onLogout, children: "Cerrar sesi\u00F3n" })] })] }) }));
};
const useItems = (pages, folders) => {
    return useMemo(() => {
        const allItems = [
            ...pages.map((page) => ({
                id: `page-${page.id}`,
                title: page.title || 'Sin título',
                type: 'page',
                parentId: page.parent_id,
                originalId: page.id,
                position: page.position || 0,
            })),
            ...folders.map((folder) => ({
                id: `folder-${folder.id}`,
                title: folder.name,
                type: 'folder',
                parentId: folder.parent_id,
                originalId: folder.id,
                position: folder.position || 0,
            }))
        ];
        const rootItems = allItems.filter(item => !item.parentId);
        const itemsByParent = allItems.reduce((acc, item) => {
            if (item.parentId) {
                const parentId = `folder-${item.parentId}`;
                if (!acc[parentId])
                    acc[parentId] = [];
                acc[parentId].push(item);
            }
            return acc;
        }, {});
        const sortItems = (items) => {
            return items.sort((a, b) => (a.position || 0) - (b.position || 0));
        };
        return {
            rootItems: sortItems(rootItems),
            itemsByParent,
            allItems,
        };
    }, [pages, folders]);
};
const StyledDrawer = styled(Drawer) `
  .MuiDrawer-paper {
    width: 280px;
    background-color: #ffffff;
    border-right: 1px solid rgba(55, 53, 47, 0.09);

    @media (max-width: 768px) {
      width: 320px;
    }
  }
`;
const Sidebar = ({ open = false, onClose }) => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { pages, folders, createPage, createFolder } = useApp();
    const { logout } = useAuth();
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [activeItemId, setActiveItemId] = useState(null);
    const items = useItems(pages, folders);
    const handleDrawerToggle = () => {
        if (onClose) {
            onClose();
        }
    };
    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            toggleFolder(item.id);
        }
        else {
            setActiveItemId(item.id);
            navigate(`/page/${item.originalId}`);
        }
        if (mobileOpen) {
            handleDrawerToggle();
        }
    };
    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            }
            else {
                next.add(folderId);
            }
            return next;
        });
    };
    const handleNewPage = async () => {
        try {
            const newPage = await createPage({ title: 'Nueva página' });
            if (newPage?.id) {
                navigate(`/page/${newPage.id}`);
            }
        }
        catch (error) {
            console.error('Error al crear nueva página:', error);
        }
        if (mobileOpen)
            handleDrawerToggle();
    };
    const handleNewFolder = async () => {
        try {
            const newFolder = await createFolder({ name: 'Nueva carpeta' });
            if (newFolder?.id) {
                const folderId = `folder-${newFolder.id}`;
                setExpandedFolders(prev => new Set([...prev, folderId]));
            }
        }
        catch (error) {
            console.error('Error al crear nueva carpeta:', error);
        }
        if (mobileOpen)
            handleDrawerToggle();
    };
    const handleLogoClick = () => {
        navigate('/');
        if (mobileOpen)
            handleDrawerToggle();
    };
    const handleSettingsClick = () => {
        navigate('/settings');
        if (mobileOpen)
            handleDrawerToggle();
    };
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        }
        catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };
    const sidebarContent = (_jsx(StyledList, { children: _jsx(SidebarContent, { items: items, expandedFolders: expandedFolders, activeItemId: activeItemId, onToggleFolder: toggleFolder, onItemClick: handleItemClick, onNewPage: handleNewPage, onNewFolder: handleNewFolder, onSettings: handleSettingsClick, onLogout: handleLogout, onLogoClick: handleLogoClick, onClose: handleDrawerToggle }) }));
    return (_jsxs(_Fragment, { children: [_jsx(StyledDrawer, { variant: "temporary", anchor: "left", open: open, onClose: handleDrawerToggle, ModalProps: {
                    keepMounted: true,
                }, sx: {
                    display: { xs: 'block', md: 'none' },
                }, children: sidebarContent }), _jsx(StyledDrawer, { variant: "permanent", sx: {
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        position: 'fixed',
                    },
                }, open: true, children: sidebarContent })] }));
};
export default Sidebar;
