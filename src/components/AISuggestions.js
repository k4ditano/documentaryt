import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, CircularProgress, Collapse, IconButton, Box, } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, LightbulbOutlined as LightbulbIcon, } from '@mui/icons-material';
import * as geminiService from '../services/geminiService';
const AISuggestions = ({ content }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [summary, setSummary] = useState('');
    const [analysis, setAnalysis] = useState({
        keywords: [],
        topics: [],
        entities: [],
    });
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
        const analyzeContent = async () => {
            if (!content.trim() || content.length < 50)
                return;
            setLoading(true);
            try {
                const [newSuggestions, newSummary, newAnalysis] = await Promise.all([
                    geminiService.generateSuggestions(content),
                    geminiService.generateSummary(content),
                    geminiService.analyzeContent(content),
                ]);
                setSuggestions(newSuggestions);
                setSummary(newSummary);
                setAnalysis(newAnalysis);
            }
            catch (error) {
                console.error('Error al analizar el contenido:', error);
            }
            finally {
                setLoading(false);
            }
        };
        const debounceTimeout = setTimeout(analyzeContent, 1000);
        return () => clearTimeout(debounceTimeout);
    }, [content]);
    if (!content.trim() || content.length < 50) {
        return null;
    }
    return (_jsxs(Paper, { sx: { p: 2, mt: 2 }, children: [_jsxs(Box, { display: "flex", alignItems: "center", onClick: () => setExpanded(!expanded), sx: { cursor: 'pointer' }, children: [_jsx(LightbulbIcon, { color: "primary", sx: { mr: 1 } }), _jsx(Typography, { variant: "h6", component: "div", sx: { flexGrow: 1 }, children: "Sugerencias de IA" }), _jsx(IconButton, { sx: {
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                        }, children: _jsx(ExpandMoreIcon, {}) })] }), _jsx(Collapse, { in: expanded, children: loading ? (_jsx(Box, { display: "flex", justifyContent: "center", p: 2, children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [summary && (_jsxs(Box, { mt: 2, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Resumen" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: summary })] })), suggestions.length > 0 && (_jsxs(Box, { mt: 2, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Sugerencias para mejorar" }), _jsx(List, { dense: true, children: suggestions.map((suggestion, index) => (_jsx(ListItem, { children: _jsx(ListItemText, { primary: suggestion }) }, index))) })] })), analysis.keywords.length > 0 && (_jsxs(Box, { mt: 2, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "An\u00E1lisis de contenido" }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "Palabras clave:" }), " ", analysis.keywords.join(', ')] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "Temas principales:" }), " ", analysis.topics.join(', ')] }), analysis.entities.length > 0 && (_jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "Entidades mencionadas:" }), " ", analysis.entities.join(', ')] }))] }))] })) })] }));
};
export default AISuggestions;
