import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Menu, MenuItem, Breadcrumbs, Link, } from '@mui/material';
import { Description as PageIcon, Folder as FolderIcon, MoreVert as MoreVertIcon, } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
const FolderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { pages, folders } = useApp();
    const [currentFolder, setCurrentFolder] = useState(null);
    const [childPages, setChildPages] = useState([]);
    const [childFolders, setChildFolders] = useState([]);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
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
    const handleMenuClick = (event, type, itemId) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
        setSelectedItem({ type, id: itemId });
    };
    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedItem(null);
    };
    const handleItemClick = (type, itemId) => {
        if (type === 'page') {
            navigate(`/page/${itemId}`);
        }
        else {
            navigate(`/folder/${itemId}`);
        }
    };
    const getBreadcrumbs = () => {
        const breadcrumbs = [];
        let currentId = currentFolder?.parent_id;
        while (currentId) {
            const parent = folders.find(f => f.id === currentId);
            if (parent) {
                breadcrumbs.unshift(parent);
                currentId = parent.parent_id;
            }
            else {
                break;
            }
        }
        return breadcrumbs;
    };
    const formatDate = (date) => {
        if (!date)
            return '';
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (_jsxs(Box, { sx: { display: 'flex', minHeight: '100vh' }, children: [_jsx(Sidebar, {}), _jsxs(Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 240px)` },
                    ml: { sm: '240px' },
                    backgroundColor: 'background.default',
                }, children: [_jsxs(Breadcrumbs, { sx: { mb: 3 }, children: [_jsx(Link, { component: "button", variant: "body1", onClick: () => navigate('/'), sx: { cursor: 'pointer' }, children: "Inicio" }), getBreadcrumbs().map((folder) => (_jsx(Link, { component: "button", variant: "body1", onClick: () => navigate(`/folder/${folder.id}`), sx: { cursor: 'pointer' }, children: folder.name }, folder.id))), currentFolder && (_jsx(Typography, { color: "text.primary", children: currentFolder.name }))] }), _jsx(Typography, { variant: "h4", gutterBottom: true, children: currentFolder?.name || 'Carpeta no encontrada' }), _jsxs(List, { children: [childFolders.map((folder) => (_jsxs(ListItem, { button: true, onClick: () => handleItemClick('folder', folder.id), secondaryAction: _jsx(IconButton, { edge: "end", onClick: (e) => handleMenuClick(e, 'folder', folder.id), children: _jsx(MoreVertIcon, {}) }), children: [_jsx(ListItemIcon, { children: _jsx(FolderIcon, {}) }), _jsx(ListItemText, { primary: folder.name, secondary: `Última modificación: ${formatDate(folder.updated_at)}` })] }, folder.id))), childPages.map((page) => (_jsxs(ListItem, { button: true, onClick: () => handleItemClick('page', page.id), secondaryAction: _jsx(IconButton, { edge: "end", onClick: (e) => handleMenuClick(e, 'page', page.id), children: _jsx(MoreVertIcon, {}) }), children: [_jsx(ListItemIcon, { children: _jsx(PageIcon, {}) }), _jsx(ListItemText, { primary: page.title, secondary: `Última modificación: ${formatDate(page.updated_at)}` })] }, page.id)))] }), _jsxs(Menu, { anchorEl: menuAnchor, open: Boolean(menuAnchor), onClose: handleMenuClose, children: [_jsx(MenuItem, { onClick: handleMenuClose, children: "Renombrar" }), _jsx(MenuItem, { onClick: handleMenuClose, children: "Eliminar" })] })] })] }));
};
export default FolderPage;
