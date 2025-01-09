import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useCallback, useEffect, useState } from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import Leaf from './Leaf';
import Element from './Element';
import Toolbar from './Toolbar';
import ImageUploadDialog from './ImageUploadDialog';
import { isHotkey } from 'is-hotkey';
import { Box } from '@mui/material';
const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};
const defaultValue = [
    {
        type: 'paragraph',
        children: [{ text: '' }],
    },
];
const SlateEditor = ({ initialValue, onChange, readOnly = false }) => {
    const editor = useMemo(() => {
        const e = withHistory(withReact(createEditor()));
        return e;
    }, []);
    const [showImageDialog, setShowImageDialog] = useState(false);
    // Actualizar el contenido del editor cuando cambia initialValue
    useEffect(() => {
        if (initialValue?.length > 0) {
            const content = Array.isArray(initialValue) ? initialValue : defaultValue;
            editor.children = content;
            editor.onChange();
        }
    }, [editor, initialValue]);
    const renderElement = useCallback((props) => _jsx(Element, { ...props }), []);
    const renderLeaf = useCallback((props) => _jsx(Leaf, { ...props }), []);
    const handleKeyDown = useCallback((event) => {
        if (readOnly)
            return;
        for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                const isActive = isMarkActive(editor, mark);
                if (isActive) {
                    Editor.removeMark(editor, mark);
                }
                else {
                    Editor.addMark(editor, mark, true);
                }
            }
        }
    }, [editor, readOnly]);
    const handleChange = useCallback((value) => {
        if (!readOnly) {
            onChange(value);
        }
    }, [onChange, readOnly]);
    const editorValue = useMemo(() => {
        return initialValue?.length > 0 ? initialValue : defaultValue;
    }, [initialValue]);
    const handleImageClick = useCallback(() => {
        setShowImageDialog(true);
    }, []);
    const handleImageUpload = useCallback((imageUrl) => {
        const image = {
            type: 'image',
            url: imageUrl,
            children: [{ text: '' }],
        };
        Transforms.insertNodes(editor, image);
    }, [editor]);
    return (_jsxs(Box, { sx: { border: readOnly ? 'none' : '1px solid', borderColor: 'divider', borderRadius: 1 }, children: [_jsxs(Slate, { editor: editor, initialValue: editorValue, onChange: handleChange, children: [!readOnly && _jsx(Toolbar, { onImageClick: handleImageClick }), _jsx(Box, { sx: { p: 2 }, children: _jsx(Editable, { readOnly: readOnly, renderElement: renderElement, renderLeaf: renderLeaf, onKeyDown: handleKeyDown, placeholder: "Comienza a escribir...", style: {
                                minHeight: '300px',
                            } }) })] }), _jsx(ImageUploadDialog, { open: showImageDialog, onClose: () => setShowImageDialog(false), onImageUpload: handleImageUpload })] }));
};
const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};
export default SlateEditor;
