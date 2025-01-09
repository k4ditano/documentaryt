import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState, useRef } from 'react';
import { BlockNoteViewRaw, useBlockNote } from '@blocknote/react';
import '@blocknote/core/style.css';
import { debounce } from 'lodash';
import { useToast } from '../../components/ui/use-toast';
import { useWebSocket } from '../../hooks/useWebSocket';
const saveContent = async (pageId, content) => {
    try {
        const response = await fetch(`/api/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error al guardar el contenido');
        }
    }
    catch (error) {
        console.error('Error al guardar:', error);
        throw error;
    }
};
export const BlockNoteEditor = ({ initialContent, pageId, onSave, readOnly = false, }) => {
    const { toast } = useToast();
    const [error, setError] = useState(null);
    const { socket } = useWebSocket();
    const changeHandlerRef = useRef(null);
    // Crear el editor
    const editor = useBlockNote({
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    });
    // Manejar cambios en el contenido con debounce
    const handleContentChange = useCallback(debounce(async (content) => {
        if (readOnly)
            return;
        try {
            await saveContent(pageId, content);
            if (onSave) {
                onSave(content);
            }
            setError(null);
            // Emitir actualización a través de WebSocket
            if (socket) {
                socket.emit('page:contentUpdate', { pageId, content });
            }
        }
        catch (err) {
            const error = err;
            setError({
                message: error.message || 'Error al guardar el contenido',
                statusCode: 500,
            });
            toast({
                variant: 'destructive',
                title: 'Error al guardar',
                description: error.message || 'No se pudo guardar el contenido',
            });
        }
    }, 1000), [pageId, onSave, socket, readOnly]);
    // Configurar el manejador de cambios
    useEffect(() => {
        if (!editor)
            return;
        const handleChange = () => {
            const content = JSON.stringify(editor.topLevelBlocks);
            handleContentChange(content);
        };
        changeHandlerRef.current = handleChange;
        editor.onEditorContentChange(handleChange);
        return () => {
            if (changeHandlerRef.current) {
                editor.onEditorContentChange(changeHandlerRef.current);
            }
        };
    }, [editor, handleContentChange]);
    // Escuchar actualizaciones de contenido de otros usuarios
    useEffect(() => {
        if (!socket || readOnly || !editor)
            return;
        const handleContentUpdate = (data) => {
            if (data.pageId === pageId) {
                try {
                    const blocks = JSON.parse(data.content);
                    editor.replaceBlocks(editor.topLevelBlocks, blocks);
                }
                catch (error) {
                    console.error('Error al actualizar el contenido:', error);
                }
            }
        };
        socket.on('page:contentUpdate', handleContentUpdate);
        return () => {
            socket.off('page:contentUpdate', handleContentUpdate);
        };
    }, [socket, pageId, editor, readOnly]);
    if (!editor) {
        return null;
    }
    return (_jsxs("div", { className: "relative w-full", children: [error && (_jsx("div", { className: "absolute top-0 right-0 p-4 bg-red-100 text-red-700 rounded-md z-10", children: error.message })), _jsx(BlockNoteViewRaw, { editor: editor, theme: "light", editable: !readOnly })] }));
};
