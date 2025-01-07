import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Collapse,
  IconButton,
  Box,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LightbulbOutlined as LightbulbIcon,
} from '@mui/icons-material';
import * as geminiService from '../services/geminiService';

interface AISuggestionsProps {
  content: string;
}

const AISuggestions = ({ content }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [analysis, setAnalysis] = useState<{
    keywords: string[];
    topics: string[];
    entities: string[];
  }>({
    keywords: [],
    topics: [],
    entities: [],
  });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const analyzeContent = async () => {
      if (!content.trim() || content.length < 50) return;

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
      } catch (error) {
        console.error('Error al analizar el contenido:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(analyzeContent, 1000);
    return () => clearTimeout(debounceTimeout);
  }, [content]);

  if (!content.trim() || content.length < 50) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box display="flex" alignItems="center" onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer' }}>
        <LightbulbIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sugerencias de IA
        </Typography>
        <IconButton
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {summary && (
              <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Resumen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary}
                </Typography>
              </Box>
            )}

            {suggestions.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Sugerencias para mejorar
                </Typography>
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {analysis.keywords.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Análisis de contenido
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Palabras clave:</strong> {analysis.keywords.join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Temas principales:</strong> {analysis.topics.join(', ')}
                </Typography>
                {analysis.entities.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Entidades mencionadas:</strong> {analysis.entities.join(', ')}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </Collapse>
    </Paper>
  );
};

export default AISuggestions; 