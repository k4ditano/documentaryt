import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography, List, ListItem, ListItemText, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Card, CardContent, } from '@mui/material';
import { Search as SearchIcon, Create as CreateIcon, PictureAsPdf as PdfIcon, Close as CloseIcon, Link as LinkIcon, Edit as EditIcon, Folder as FolderIcon, LocalOffer as LocalOfferIcon, MergeType as MergeTypeIcon, Chat as ChatIcon, Send as SendIcon, } from '@mui/icons-material';
import * as geminiService from '../services/geminiService';
import * as pdfService from '../services/pdfService';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
const defaultBlockProps = {
    textAlignment: "left"
};
const defaultBlockStyle = {};
const createBlock = (type, text, id, props = {}, styles = {}) => ({
    id,
    type,
    content: [{
            type: "text",
            text,
            styles: { ...defaultBlockStyle, ...styles }
        }],
    props: { ...defaultBlockProps, ...props }
});
const AISearch = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [suggestedActions, setSuggestedActions] = useState([]);
    const [filters, setFilters] = useState({
        categories: [],
        tags: [],
        dateRanges: [],
        relevanceThreshold: 0.7
    });
    const [selectedFilters, setSelectedFilters] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [pdfAnalysis, setPdfAnalysis] = useState(null);
    const [showPdfDialog, setShowPdfDialog] = useState(false);
    const fileInputRef = useRef(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const chatEndRef = useRef(null);
    const { pages, createPage, updatePage } = useApp();
    const navigate = useNavigate();
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);
    const addChatMessage = (message) => {
        setChatMessages(prevMessages => [...prevMessages, message]);
    };
    const handleChatSearch = async () => {
        if (!currentMessage.trim())
            return;
        setLoading(true);
        const originalMessage = currentMessage;
        setCurrentMessage('');
        const userMessage = {
            type: 'user',
            content: originalMessage,
            timestamp: new Date()
        };
        addChatMessage(userMessage);
        try {
            const freshPages = await storageService.getPages();
            const previousSearchResults = chatMessages
                .filter(msg => msg.type === 'search')
                .map(msg => msg.content)
                .flat();
            const searchResults = await geminiService.searchContent(originalMessage, freshPages, previousSearchResults);
            const aiResponse = await geminiService.generateChatResponse(originalMessage, searchResults.results, previousSearchResults);
            if (aiResponse.includes('[EXTERNAL]')) {
                const cleanResponse = aiResponse.replace('[EXTERNAL]', '');
                const aiMessage = {
                    type: 'ai',
                    content: cleanResponse + '\n\n(Esta información proviene de fuentes externas, no de tus documentos)',
                    timestamp: new Date()
                };
                addChatMessage(aiMessage);
            }
            else {
                const aiMessage = {
                    type: 'ai',
                    content: aiResponse,
                    timestamp: new Date()
                };
                addChatMessage(aiMessage);
                if (searchResults.results.length > 0) {
                    const searchMessage = {
                        type: 'search',
                        content: searchResults.results,
                        timestamp: new Date(),
                        originalMessage: originalMessage
                    };
                    addChatMessage(searchMessage);
                }
            }
            if (searchResults.suggestedActions && searchResults.suggestedActions.length > 0) {
                setSuggestedActions(searchResults.suggestedActions);
            }
        }
        catch (error) {
            console.error('Error en la búsqueda:', error);
            const errorMessage = {
                type: 'ai',
                content: 'Lo siento, ha ocurrido un error al procesar tu consulta.',
                timestamp: new Date()
            };
            addChatMessage(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = async () => {
        if (!query.trim())
            return;
        setLoading(true);
        try {
            const freshPages = await storageService.getPages();
            const searchResults = await geminiService.searchContent(query, freshPages);
            setResults(searchResults.results);
            setSuggestedActions(searchResults.suggestedActions || []);
            setShowResults(true);
        }
        catch (error) {
            console.error('Error en la búsqueda:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSuggestedAction = async (action) => {
        try {
            switch (action.type) {
                case 'create_page': {
                    const generatedContent = await geminiService.generateContent(action.title);
                    const newPage = await createPage({
                        title: action.title,
                        content: generatedContent,
                        tags: action.suggestedTags
                    });
                    if (!newPage?.id) {
                        throw new Error('Error al crear la página');
                    }
                    setChatOpen(false);
                    setCurrentMessage('');
                    setChatMessages([]);
                    navigate(`/page/${newPage.id}`);
                    break;
                }
                // ... otros casos
            }
        }
        catch (error) {
            console.error('Error al ejecutar la acción sugerida:', error);
        }
    };
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            try {
                const analysis = await pdfService.analyzePDF(file);
                setPdfAnalysis(analysis);
                setShowPdfDialog(true);
            }
            catch (error) {
                console.error('Error al analizar PDF:', error);
            }
        }
    };
    const handleCreateFromPDF = async () => {
        if (!pdfAnalysis || !selectedFile)
            return;
        try {
            const blocks = [
                createBlock("heading", pdfAnalysis.suggestedTitle, "1", { level: 1 }),
                createBlock("paragraph", "Resumen:", "2", {}, { bold: true }),
                createBlock("paragraph", pdfAnalysis.summary, "3"),
                createBlock("paragraph", "Puntos clave:", "4", {}, { bold: true }),
                createBlock("bullet_list", pdfAnalysis.keyPoints.join('\n'), "5"),
                {
                    id: "6",
                    type: "paragraph",
                    content: [
                        { type: "text", text: "Extraído del PDF: ", styles: { italic: true } },
                        { type: "text", text: selectedFile.name, styles: { italic: true } }
                    ],
                    props: defaultBlockProps
                }
            ];
            const newPage = await createPage({
                title: pdfAnalysis.suggestedTitle,
                content: JSON.stringify(blocks),
                tags: pdfAnalysis.tags
            });
            navigate(`/page/${newPage.id}`);
            setShowPdfDialog(false);
        }
        catch (error) {
            console.error('Error al crear página desde PDF:', error);
        }
    };
    const handleResultClick = async (result) => {
        if (result.type === 'page' && result.id) {
            navigate(`/page/${result.id}`);
        }
    };
    const getMatchTypeIcon = (matchType) => {
        switch (matchType) {
            case 'title': return _jsx(EditIcon, {});
            case 'content': return _jsx(SearchIcon, {});
            case 'tag': return _jsx(LocalOfferIcon, {});
            default: return _jsx(SearchIcon, {});
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };
    const getActionIcon = (type) => {
        switch (type) {
            case 'create_page': return _jsx(CreateIcon, {});
            case 'read_pdf': return _jsx(PdfIcon, {});
            case 'link_pages': return _jsx(LinkIcon, {});
            case 'organize_content': return _jsx(FolderIcon, {});
            case 'add_tags': return _jsx(LocalOfferIcon, {});
            case 'merge_pages': return _jsx(MergeTypeIcon, {});
            default: return _jsx(CreateIcon, {});
        }
    };
    return (_jsxs(Box, { sx: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs(Box, { sx: { p: 2, display: 'flex', gap: 1 }, children: [_jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Buscar o hacer una pregunta...", value: query, onChange: (e) => setQuery(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSearch() }), _jsx(IconButton, { onClick: handleSearch, disabled: loading, children: loading ? _jsx(CircularProgress, { size: 24 }) : _jsx(SearchIcon, {}) }), _jsx(IconButton, { onClick: () => setChatOpen(true), children: _jsx(ChatIcon, {}) }), _jsx("input", { type: "file", accept: ".pdf", style: { display: 'none' }, ref: fileInputRef, onChange: handleFileSelect }), _jsx(IconButton, { onClick: () => fileInputRef.current?.click(), children: _jsx(PdfIcon, {}) })] }), showResults && (_jsxs(Box, { sx: { flex: 1, overflow: 'auto', p: 2 }, children: [_jsx(List, { children: results.map((result, index) => (_jsx(ListItem, { button: true, onClick: () => handleResultClick(result), sx: { mb: 1 }, children: _jsx(ListItemText, { primary: _jsxs(Typography, { variant: "subtitle1", children: [getMatchTypeIcon(result.matchType), _jsx("span", { style: { marginLeft: 8 }, children: result.title })] }), secondary: result.excerpt }) }, index))) }), suggestedActions.length > 0 && (_jsxs(Box, { sx: { mt: 2 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Acciones sugeridas" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1 }, children: suggestedActions.map((action, index) => (_jsx(Card, { sx: {
                                        minWidth: 275,
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'action.hover' }
                                    }, onClick: () => handleSuggestedAction(action), children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", component: "div", sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [getActionIcon(action.type), action.title] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: action.description }), _jsxs(Box, { sx: { mt: 1, display: 'flex', gap: 0.5 }, children: [_jsx(Chip, { size: "small", label: action.priority, color: getPriorityColor(action.priority) }), action.category && (_jsx(Chip, { size: "small", label: action.category }))] })] }) }, index))) })] }))] })), _jsxs(Dialog, { open: showPdfDialog, onClose: () => setShowPdfDialog(false), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["An\u00E1lisis del PDF", _jsx(IconButton, { onClick: () => setShowPdfDialog(false), sx: { position: 'absolute', right: 8, top: 8 }, children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { children: pdfAnalysis && (_jsxs(Box, { sx: { mt: 2 }, children: [_jsxs(Typography, { variant: "h6", children: ["T\u00EDtulo sugerido: ", pdfAnalysis.suggestedTitle] }), _jsx(Typography, { variant: "subtitle1", sx: { mt: 2 }, children: "Resumen" }), _jsx(Typography, { variant: "body1", children: pdfAnalysis.summary }), _jsx(Typography, { variant: "subtitle1", sx: { mt: 2 }, children: "Puntos clave" }), _jsx(List, { children: pdfAnalysis.keyPoints.map((point, index) => (_jsx(ListItem, { children: _jsx(ListItemText, { primary: point }) }, index))) }), _jsxs(Box, { sx: { mt: 2 }, children: [_jsx(Typography, { variant: "subtitle1", children: "Etiquetas sugeridas" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }, children: pdfAnalysis.tags.map((tag, index) => (_jsx(Chip, { label: tag }, index))) })] })] })) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setShowPdfDialog(false), children: "Cancelar" }), _jsx(Button, { onClick: handleCreateFromPDF, variant: "contained", color: "primary", children: "Crear p\u00E1gina" })] })] }), _jsxs(Dialog, { open: chatOpen, onClose: () => setChatOpen(false), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["Chat con AI", _jsx(IconButton, { onClick: () => setChatOpen(false), sx: { position: 'absolute', right: 8, top: 8 }, children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { children: _jsxs(Box, { sx: {
                                height: '60vh',
                                display: 'flex',
                                flexDirection: 'column'
                            }, children: [_jsxs(Box, { sx: {
                                        flex: 1,
                                        overflow: 'auto',
                                        mb: 2,
                                        p: 2
                                    }, children: [chatMessages.map((message, index) => (_jsx(Box, { sx: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                                                mb: 2
                                            }, children: message.type === 'search' ? (_jsxs(Box, { sx: { width: '100%' }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Fuentes relacionadas:" }), _jsx(List, { children: message.content.map((result, resultIndex) => (_jsx(ListItem, { button: true, onClick: () => handleResultClick(result), children: _jsx(ListItemText, { primary: result.title, secondary: result.excerpt }) }, resultIndex))) })] })) : (_jsx(Paper, { sx: {
                                                    p: 2,
                                                    maxWidth: '70%',
                                                    bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                                                    color: message.type === 'user' ? 'primary.contrastText' : 'text.primary'
                                                }, children: _jsx(Typography, { variant: "body1", children: message.content }) })) }, index))), _jsx("div", { ref: chatEndRef })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Escribe tu mensaje...", value: currentMessage, onChange: (e) => setCurrentMessage(e.target.value), onKeyPress: (e) => e.key === 'Enter' && !e.shiftKey && handleChatSearch(), multiline: true, maxRows: 4 }), _jsx(IconButton, { onClick: handleChatSearch, disabled: loading, color: "primary", children: loading ? _jsx(CircularProgress, { size: 24 }) : _jsx(SendIcon, {}) })] })] }) })] })] }));
};
export default AISearch;
