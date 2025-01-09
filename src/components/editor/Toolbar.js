import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import { FormatBold, FormatItalic, FormatUnderlined, Code, FormatListBulleted, FormatListNumbered, Title, Image as ImageIcon, TableChart, Functions, } from '@mui/icons-material';
import { useSlate } from 'slate-react';
import { Editor, Element as SlateElement, Transforms } from 'slate';
const Toolbar = ({ onImageClick }) => {
    const editor = useSlate();
    const isBlockActive = (format) => {
        const [match] = Array.from(Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
        }));
        return !!match;
    };
    const isMarkActive = (format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    };
    const toggleBlock = (format) => {
        const isActive = isBlockActive(format);
        Transforms.setNodes(editor, { type: isActive ? 'paragraph' : format }, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
        });
    };
    const toggleMark = (format) => {
        const isActive = isMarkActive(format);
        if (isActive) {
            Editor.removeMark(editor, format);
        }
        else {
            Editor.addMark(editor, format, true);
        }
    };
    return (_jsxs(Box, { sx: {
            display: 'flex',
            alignItems: 'center',
            padding: 1,
            gap: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            flexWrap: 'wrap',
        }, children: [_jsx(Tooltip, { title: "Negrita (Ctrl+B)", children: _jsx(IconButton, { size: "small", onClick: () => toggleMark('bold'), color: isMarkActive('bold') ? 'primary' : 'default', children: _jsx(FormatBold, {}) }) }), _jsx(Tooltip, { title: "Cursiva (Ctrl+I)", children: _jsx(IconButton, { size: "small", onClick: () => toggleMark('italic'), color: isMarkActive('italic') ? 'primary' : 'default', children: _jsx(FormatItalic, {}) }) }), _jsx(Tooltip, { title: "Subrayado (Ctrl+U)", children: _jsx(IconButton, { size: "small", onClick: () => toggleMark('underline'), color: isMarkActive('underline') ? 'primary' : 'default', children: _jsx(FormatUnderlined, {}) }) }), _jsx(Tooltip, { title: "C\u00F3digo (Ctrl+`)", children: _jsx(IconButton, { size: "small", onClick: () => toggleMark('code'), color: isMarkActive('code') ? 'primary' : 'default', children: _jsx(Code, {}) }) }), _jsx(Divider, { orientation: "vertical", flexItem: true, sx: { mx: 1 } }), _jsx(Tooltip, { title: "Encabezado", children: _jsx(IconButton, { size: "small", onClick: () => toggleBlock('heading'), color: isBlockActive('heading') ? 'primary' : 'default', children: _jsx(Title, {}) }) }), _jsx(Tooltip, { title: "Lista con vi\u00F1etas", children: _jsx(IconButton, { size: "small", onClick: () => toggleBlock('bulleted-list'), color: isBlockActive('bulleted-list') ? 'primary' : 'default', children: _jsx(FormatListBulleted, {}) }) }), _jsx(Tooltip, { title: "Lista numerada", children: _jsx(IconButton, { size: "small", onClick: () => toggleBlock('numbered-list'), color: isBlockActive('numbered-list') ? 'primary' : 'default', children: _jsx(FormatListNumbered, {}) }) }), _jsx(Divider, { orientation: "vertical", flexItem: true, sx: { mx: 1 } }), _jsx(Tooltip, { title: "Insertar imagen", children: _jsx(IconButton, { size: "small", onClick: onImageClick, children: _jsx(ImageIcon, {}) }) }), _jsx(Tooltip, { title: "Insertar tabla", children: _jsx(IconButton, { size: "small", onClick: () => toggleBlock('table'), color: isBlockActive('table') ? 'primary' : 'default', children: _jsx(TableChart, {}) }) }), _jsx(Tooltip, { title: "Insertar f\u00F3rmula", children: _jsx(IconButton, { size: "small", onClick: () => toggleBlock('math'), color: isBlockActive('math') ? 'primary' : 'default', children: _jsx(Functions, {}) }) })] }));
};
export default Toolbar;
