import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Create as CreateIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  LocalOffer as LocalOfferIcon,
  MergeType as MergeTypeIcon,
  Chat as ChatIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import * as geminiService from '../services/geminiService';
import type { SearchResult } from '../services/geminiService';
import * as pdfService from '../services/pdfService';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import type { Page } from '../types';
import { taskService, Task, TaskStatus, TaskPriority } from '../services/taskService';
import { storageService } from '../services/storageService';

interface PDFAnalysis {
  summary: string;
  suggestedTitle: string;
  keyPoints: string[];
  tags: string[];
}

interface SuggestedAction {
  type: 'create_page' | 'read_pdf' | 'link_pages' | 'expand_content' | 'organize_content' | 'add_tags' | 'merge_pages';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedPageIds?: string[];
  suggestedTags?: string[];
  category?: string;
}

interface SearchFilters {
  categories: string[];
  tags: string[];
  dateRanges: string[];
  relevanceThreshold: number;
}

interface BlockStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  textColor?: string;
  backgroundColor?: string;
}

interface BlockContent {
  type: string;
  text: string;
  styles?: BlockStyle;
}

interface BlockProps {
  textAlignment?: "left" | "center" | "right";
  level?: number;
}

interface Block {
  id: string;
  type: string;
  content: BlockContent[];
  props: BlockProps;
}

interface BaseMessage {
  timestamp: Date;
  originalMessage?: string;
}

interface UserMessage extends BaseMessage {
  type: 'user';
  content: string;
}

interface AIMessage extends BaseMessage {
  type: 'ai';
  content: string;
}

interface SearchMessage extends BaseMessage {
  type: 'search';
  content: SearchResult[];
}

type ChatMessage = UserMessage | AIMessage | SearchMessage;

const defaultBlockProps: BlockProps = {
  textAlignment: "left"
};

const defaultBlockStyle: BlockStyle = {};

const createBlock = (
  type: string,
  text: string,
  id: string,
  props: Partial<BlockProps> = {},
  styles: BlockStyle = {}
): Block => ({
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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<Array<SuggestedAction>>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    tags: [],
    dateRanges: [],
    relevanceThreshold: 0.7
  });
  const [selectedFilters, setSelectedFilters] = useState<{
    category?: string;
    tag?: string;
    dateRange?: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfAnalysis, setPdfAnalysis] = useState<PDFAnalysis | null>(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { pages, createPage, updatePage } = useApp();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Añadir useEffect para manejar el auto-scroll cuando se añaden mensajes
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prevMessages => [...prevMessages, message]);
  };

  const handleChatSearch = async () => {
    if (!currentMessage.trim()) return;
    
    setLoading(true);
    
    // Guardar el mensaje original
    const originalMessage = currentMessage;
    setCurrentMessage('');
    
    // Añadir mensaje del usuario
    const userMessage: UserMessage = {
        type: 'user',
        content: originalMessage,
        timestamp: new Date()
    };
    addChatMessage(userMessage);
    
    try {
        // Obtener los datos más recientes de las páginas
        const freshPages = await storageService.getPages();
        
        // Verificar si hay resultados previos en el contexto de la conversación
        const previousSearchResults = chatMessages
            .filter(msg => msg.type === 'search')
            .map(msg => (msg as SearchMessage).content)
            .flat();

        // Buscar primero en el contexto de la conversación
        const searchResults = await geminiService.searchContent(originalMessage, freshPages, previousSearchResults);
        
        // Generar respuesta de la AI usando los resultados de búsqueda y el contexto
        const aiResponse = await geminiService.generateChatResponse(
            originalMessage,
            searchResults.results,
            previousSearchResults
        );
        
        // Si la respuesta indica que es información externa
        if (aiResponse.includes('[EXTERNAL]')) {
            const cleanResponse = aiResponse.replace('[EXTERNAL]', '');
            const aiMessage: AIMessage = {
                type: 'ai',
                content: cleanResponse + '\n\n(Esta información proviene de fuentes externas, no de tus documentos)',
                timestamp: new Date()
            };
            addChatMessage(aiMessage);
        } else {
            // Primero añadir la respuesta de la AI
            const aiMessage: AIMessage = {
                type: 'ai',
                content: aiResponse,
                timestamp: new Date()
            };
            addChatMessage(aiMessage);

            // Luego, si hay resultados, mostrar los enlaces a las páginas como fuentes
            if (searchResults.results.length > 0) {
                const searchMessage: SearchMessage = {
                    type: 'search',
                    content: searchResults.results,
                    timestamp: new Date(),
                    originalMessage: originalMessage
                };
                addChatMessage(searchMessage);

                // Añadir mensaje explicativo sobre las fuentes
                const sourcesMessage: AIMessage = {
                    type: 'ai',
                    content: 'He basado mi respuesta en la información encontrada en las páginas mostradas arriba. ¿Hay algo más específico que te gustaría saber sobre estos resultados?',
                    timestamp: new Date()
                };
                addChatMessage(sourcesMessage);
            }
        }

        // Si no se encontraron resultados en las páginas ni externamente
        if (searchResults.results.length === 0 && !aiResponse.includes('[EXTERNAL]')) {
            const deductionMessage: AIMessage = {
                type: 'ai',
                content: 'No he encontrado información específica sobre tu consulta en tus documentos. ¿Te gustaría:\n\n' +
                        '1. ¿Reformular tu pregunta de otra manera?\n' +
                        '2. ¿Crear una nueva página con esta información?\n' +
                        '3. ¿Buscar en una categoría específica?\n' +
                        '4. ¿Que busque información externa sobre este tema?\n\n' +
                        'Por favor, indícame cómo puedo ayudarte mejor.',
                timestamp: new Date()
            };
            addChatMessage(deductionMessage);
        }

    } catch (error) {
        console.error('Error en la búsqueda:', error);
        const errorMessage: AIMessage = {
            type: 'ai',
            content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
            timestamp: new Date()
        };
        addChatMessage(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  // Añadir mensaje de bienvenida cuando se abre el chat
  useEffect(() => {
    if (chatOpen && chatMessages.length === 0) {
      setChatMessages([{
        type: 'ai',
        content: '¡Hola! 👋 Soy el asistente de Documentary T. Estoy aquí para ayudarte con:\n\n' +
                '📝 Crear y gestionar documentos:\n' +
                '   • Crear nuevas páginas con contenido estructurado\n' +
                '   • Organizar y categorizar documentos\n' +
                '   • Vincular páginas relacionadas\n\n' +
                '✅ Gestionar tareas y recordatorios:\n' +
                '   • Crear y organizar tareas por prioridad\n' +
                '   • Establecer fechas límite y recordatorios\n' +
                '   • Ver tareas pendientes y su estado\n\n' +
                '🔍 Búsqueda inteligente:\n' +
                '   • Buscar información en tus documentos\n' +
                '   • Encontrar contenido relacionado\n' +
                '   • Sugerir conexiones entre documentos\n\n' +
                '📚 Análisis de documentos:\n' +
                '   • Analizar y extraer información de PDFs\n' +
                '   • Generar resúmenes automáticos\n' +
                '   • Identificar puntos clave\n\n' +
                '🏷️ Organización y etiquetado:\n' +
                '   • Generar y gestionar etiquetas\n' +
                '   • Categorizar contenido\n' +
                '   • Sugerir mejoras de organización\n\n' +
                '¿En qué puedo ayudarte hoy? 😊 Puedes preguntarme de forma natural y te ayudaré a encontrar la mejor solución.',
        timestamp: new Date()
      }]);
      scrollToBottom();
    }
  }, [chatOpen]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setShowResults(true);
    
    try {
      const searchResults = await geminiService.searchContent(query, pages);
      setResults(searchResults.results);
      setSuggestedActions(searchResults.suggestedActions);
      setFilters(searchResults.filters);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedAction = async (action: SuggestedAction) => {
    if (loading) return;
    setLoading(true);
    
    try {
      switch (action.type) {
        case 'create_page': {
          // Limpiar y validar el título
          const title = action.title.trim();
          if (!title) {
            throw new Error('El título no puede estar vacío');
          }

          // Generar contenido específico para la página
          const generatedContent = await geminiService.generateContent(title);
          
          // Crear la página con el contenido generado
          const newPage = await createPage(title, null);
          if (!newPage?.id) {
            throw new Error('Error al crear la página');
          }

          // Actualizar la página con el contenido
          await updatePage(newPage.id, { content: generatedContent });
          
          // Cerrar el diálogo y limpiar el estado
          setChatOpen(false);
          setCurrentMessage('');
          setChatMessages([]);
          
          // Navegar a la nueva página
          navigate(`/page/${newPage.id}`);
          break;
        }
        
        case 'expand_content': {
          const pageId = action.relatedPageIds?.[0];
          if (pageId) {
            const pageToExpand = pages.find(p => p.id === pageId);
            if (pageToExpand) {
              const expandedContent = await geminiService.generateContent(
                `Expandir contenido sobre: ${action.title}\nContenido actual: ${pageToExpand.content}`
              );
              await updatePage(pageToExpand.id, { content: expandedContent });
              navigate(`/page/${pageToExpand.id}`);
            }
          }
          break;
        }
        
        case 'link_pages': {
          const relatedIds = action.relatedPageIds;
          if (relatedIds && relatedIds.length >= 2) {
            navigate(`/page/${relatedIds[0]}`);
          }
          break;
        }
      }
      
      // Limpiar el estado y la UI
      setQuery('');
      setResults([]);
      setSuggestedActions([]);
      setShowResults(false);
      
    } catch (error) {
      console.error('Error al ejecutar acción sugerida:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setShowPdfDialog(true);
    setPdfAnalysis(null);
    
    try {
      const pdfText = await pdfService.extractTextFromPDF(file);
      const analysis = await geminiService.analyzePDF(pdfText);
      setPdfAnalysis(analysis);
    } catch (error) {
      console.error('Error al analizar PDF:', error);
    }
  };

  const handleCreateFromPDF = async () => {
    if (!pdfAnalysis || !selectedFile) return;
    
    try {
      const blocks = [
        createBlock("heading", pdfAnalysis.suggestedTitle, "1", { level: 1 }),
        createBlock("paragraph", pdfAnalysis.summary, "2"),
        createBlock("heading", "Puntos Clave", "3", { level: 2 }),
        ...pdfAnalysis.keyPoints.map((point, index) => 
          createBlock("bulletListItem", point, `4.${index}`)
        ),
        {
          id: "5",
          type: "paragraph",
          content: [
            { type: "text", text: "Tags: ", styles: {} },
            ...pdfAnalysis.tags.map((tag, index) => ({
              type: "text",
              text: `#${tag}${index < pdfAnalysis.tags.length - 1 ? ' ' : ''}`,
              styles: { code: true }
            }))
          ],
          props: defaultBlockProps
        },
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

      const newPage = await createPage(pdfAnalysis.suggestedTitle, null);
      await updatePage(newPage.id, { 
        content: JSON.stringify(blocks)
      });
      navigate(`/page/${newPage.id}`);
      setShowPdfDialog(false);
    } catch (error) {
      console.error('Error al crear página desde PDF:', error);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    try {
      // Navegar a la página
      navigate(`/page/${result.pageId}`);
      
      // Cerrar el diálogo de resultados
      setShowResults(false);
      
      // Limpiar la búsqueda
      setQuery('');
      setResults([]);
      setSuggestedActions([]);

      // Emitir un evento personalizado para que el Editor sepa qué texto resaltar
      const searchEvent = new CustomEvent('searchHighlight', {
        detail: {
          searchText: result.snippet,
          pageId: result.pageId
        }
      });
      window.dispatchEvent(searchEvent);
    } catch (error) {
      console.error('Error al navegar al resultado:', error);
    }
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact': return '🎯';
      case 'partial': return '📍';
      case 'related': return '🔗';
      default: return '•';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      case 'low': return 'success.main';
      default: return 'text.secondary';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create_page': return <CreateIcon />;
      case 'read_pdf': return <PdfIcon />;
      case 'link_pages': return <LinkIcon />;
      case 'expand_content': return <EditIcon />;
      case 'organize_content': return <FolderIcon />;
      case 'add_tags': return <LocalOfferIcon />;
      case 'merge_pages': return <MergeTypeIcon />;
      default: return <CreateIcon />;
    }
  };

  const filteredResults = results.filter(result => {
    if (selectedFilters.category && result.category !== selectedFilters.category) return false;
    if (selectedFilters.tag && !result.suggestion?.includes(selectedFilters.tag)) return false;
    // Añadir más filtros según sea necesario
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => {
          setChatOpen(true);
          if (query) {
            setCurrentMessage(query);
            handleChatSearch();
          }
        }}>
          {loading ? <CircularProgress size={24} /> : <ChatIcon />}
        </IconButton>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        <IconButton onClick={() => fileInputRef.current?.click()}>
          <PdfIcon />
        </IconButton>
      </Box>

      <Dialog 
        open={chatOpen} 
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth <= 768}
        sx={{
          '& .MuiDialog-paper': {
            height: { xs: '100%', sm: '80vh' },
            maxHeight: { xs: '100%', sm: '80vh' },
            width: { xs: '100%', sm: '90%', md: '800px' },
            margin: { xs: 0, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fbfbfa',
            borderRadius: { xs: 0, sm: '8px' },
            boxShadow: '0 2px 6px rgba(55, 53, 47, 0.09)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
          padding: { xs: '12px 16px', sm: '14px 20px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fbfbfa',
        }}>
          <Box component="div" sx={{ 
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgb(55, 53, 47)',
          }}>
            Chat de Búsqueda
          </Box>
          <IconButton
            onClick={() => setChatOpen(false)}
            size="small"
            sx={{ 
              color: 'rgb(55, 53, 47)',
              '&:hover': {
                backgroundColor: 'rgba(55, 53, 47, 0.08)',
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2,
          p: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 4 },
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: { xs: '6px', sm: '10px' },
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(55, 53, 47, 0.1)',
            borderRadius: '5px',
            border: '2px solid #ffffff',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(55, 53, 47, 0.2)',
          }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: { xs: 2, sm: 3 },
          }}>
            {chatMessages.map((msg, index) => (
              <Box
                key={`chat-message-${index}-${msg.timestamp.getTime()}`}
                sx={{
                  display: 'flex',
                  flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                  gap: { xs: 1, sm: 2 },
                  alignItems: 'flex-start',
                  width: '100%',
                  pt: 1,
                }}
              >
                <Avatar sx={{ 
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  bgcolor: msg.type === 'user' ? 'rgba(55, 53, 47, 0.1)' : 
                           msg.type === 'ai' ? '#2ecc71' : '#3498db',
                  fontSize: { xs: '12px', sm: '14px' },
                  color: msg.type === 'user' ? 'rgb(55, 53, 47)' : '#ffffff',
                  flexShrink: 0
                }}>
                  {msg.type === 'user' ? 'U' : 
                   msg.type === 'ai' ? 'AI' : 'S'}
                </Avatar>
                
                <Card sx={{ 
                  maxWidth: { xs: '85%', sm: '75%' },
                  width: 'fit-content',
                  bgcolor: msg.type === 'user' ? 'rgba(55, 53, 47, 0.04)' : '#ffffff',
                  boxShadow: msg.type === 'user' ? 'none' : '0 1px 3px rgba(55, 53, 47, 0.1)',
                  borderRadius: '8px',
                  border: msg.type !== 'user' ? '1px solid rgba(55, 53, 47, 0.09)' : 'none',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ 
                    padding: { xs: '8px 12px', sm: '12px 16px' },
                    '&:last-child': { paddingBottom: { xs: '8px', sm: '12px' } },
                    wordBreak: 'break-word'
                  }}>
                    {msg.type === 'search' ? (
                      <Box>
                        <List sx={{ p: 0 }}>
                          {(msg.content as SearchResult[]).map((result, resultIndex) => (
                            <ListItem 
                              key={`search-result-${index}-${resultIndex}-${result.pageId}`}
                              sx={{ 
                                cursor: 'pointer',
                                p: 1,
                                borderRadius: '4px',
                                '&:hover': {
                                  backgroundColor: 'rgba(55, 53, 47, 0.04)',
                                }
                              }}
                              onClick={() => handleResultClick(result)}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography component="span" sx={{ fontSize: '14px' }}>
                                      {getMatchTypeIcon(result.matchType)}
                                    </Typography>
                                    <Typography component="span" sx={{ 
                                      fontSize: '14px',
                                      color: 'rgb(55, 53, 47)',
                                      fontWeight: 500
                                    }}>
                                      {result.title}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      display: 'block',
                                      mt: 0.5,
                                      color: 'rgba(55, 53, 47, 0.65)',
                                      fontSize: '13px'
                                    }}
                                  >
                                    {result.snippet}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          color: 'rgb(55, 53, 47)',
                          fontSize: { xs: '14px', sm: '15px' },
                          lineHeight: 1.5
                        }}
                      >
                        {msg.content}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))}
            <div ref={chatEndRef} />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          bgcolor: '#fbfbfa',
          borderTop: '1px solid rgba(55, 53, 47, 0.09)',
        }}>
          <TextField
            fullWidth
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSearch()}
            placeholder="Escribe tu pregunta..."
            variant="outlined"
            size="small"
            sx={{
              mr: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                fontSize: { xs: '13px', sm: '14px' },
                '& fieldset': {
                  borderColor: 'rgba(55, 53, 47, 0.16)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(55, 53, 47, 0.32)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2ecc71',
                },
              },
            }}
          />
          <IconButton 
            onClick={handleChatSearch}
            disabled={loading || !currentMessage.trim()}
            color="primary"
            sx={{
              color: '#2ecc71',
              '&:hover': {
                backgroundColor: 'rgba(46, 204, 113, 0.08)',
              },
              '&.Mui-disabled': {
                color: 'rgba(55, 53, 47, 0.2)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#2ecc71' }} /> : <SendIcon />}
          </IconButton>
        </DialogActions>
      </Dialog>

      {showResults && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Resultados</Typography>
            <IconButton size="small" onClick={() => setShowResults(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {(filters.categories.length > 0 || filters.tags.length > 0) && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Filtros:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filters.categories.length > 0 && (
                  <Select
                    size="small"
                    value={selectedFilters.category || ''}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, category: e.target.value }))}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {filters.categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                )}
                {filters.tags.length > 0 && (
                  <Select
                    size="small"
                    value={selectedFilters.tag || ''}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, tag: e.target.value }))}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="">Todas las etiquetas</MenuItem>
                    {filters.tags.map(tag => (
                      <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                    ))}
                  </Select>
                )}
              </Box>
            </Box>
          )}

          {filteredResults.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Páginas encontradas:</Typography>
              <List>
                {filteredResults.map((result) => (
                  <ListItem 
                    key={result.pageId} 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }} 
                    onClick={() => handleResultClick(result)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span">{getMatchTypeIcon(result.matchType)}</Typography>
                          <Typography component="span">{result.title}</Typography>
                          <Chip 
                            size="small" 
                            label={result.category} 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box component="span">
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              backgroundColor: 'action.hover',
                              p: 1,
                              borderRadius: 1,
                              display: 'block'
                            }}
                          >
                            {result.context}
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: 'warning.main',
                                fontWeight: 'bold',
                                display: 'block'
                              }}
                            >
                              {result.snippet}
                            </Typography>
                          </Typography>
                          {result.suggestion && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ mt: 0.5, color: 'info.main', display: 'block' }}
                            >
                              💡 {result.suggestion}
                            </Typography>
                          )}
                          {result.lastModified && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ mt: 0.5, color: 'text.secondary', display: 'block' }}
                            >
                              📅 Última modificación: {new Date(result.lastModified).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {suggestedActions.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Acciones sugeridas:</Typography>
              <List>
                {suggestedActions.map((action, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span">{action.title}</Typography>
                          <Chip 
                            size="small" 
                            label={action.priority}
                            sx={{ 
                              backgroundColor: getPriorityColor(action.priority),
                              color: 'white'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="div" variant="body2">
                            {action.description}
                          </Typography>
                          {action.suggestedTags && action.suggestedTags.length > 0 && (
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {action.suggestedTags.map(tag => (
                                <Chip
                                  key={tag}
                                  size="small"
                                  label={tag}
                                  sx={{ backgroundColor: 'action.selected' }}
                                />
                              ))}
                            </Box>
                          )}
                          {action.relatedPageIds && action.relatedPageIds.length > 0 && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              📑 Páginas relacionadas: {action.relatedPageIds.map(id => {
                                const page = pages.find(p => p.id === id);
                                return page ? page.title : id;
                              }).join(', ')}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <Button
                      startIcon={getActionIcon(action.type)}
                      onClick={() => handleSuggestedAction(action)}
                      sx={{
                        color: getPriorityColor(action.priority)
                      }}
                    >
                      {action.type === 'create_page' ? 'Crear' :
                       action.type === 'read_pdf' ? 'Leer PDF' :
                       action.type === 'link_pages' ? 'Ver Enlaces' :
                       action.type === 'expand_content' ? 'Expandir' :
                       action.type === 'organize_content' ? 'Organizar' :
                       action.type === 'add_tags' ? 'Añadir Tags' :
                       'Combinar'}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}

      <Dialog open={showPdfDialog} onClose={() => setShowPdfDialog(false)} maxWidth="md" fullWidth>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
          padding: '14px 20px',
          backgroundColor: '#fbfbfa',
        }}>
          <Typography component="div" sx={{ 
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgb(55, 53, 47)',
          }}>
            Análisis del PDF
          </Typography>
          <IconButton
            onClick={() => setShowPdfDialog(false)}
            size="small"
            sx={{ 
              color: 'rgb(55, 53, 47)',
              '&:hover': {
                backgroundColor: 'rgba(55, 53, 47, 0.08)',
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ 
          p: 3,
          backgroundColor: '#ffffff',
        }}>
          {!pdfAnalysis ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: '#2ecc71' }} />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ 
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgb(55, 53, 47)',
                mb: 2
              }}>
                {pdfAnalysis.suggestedTitle}
              </Typography>
              <Typography variant="body1" sx={{ 
                fontSize: '14px',
                color: 'rgb(55, 53, 47)',
                mb: 3,
                lineHeight: 1.5
              }}>
                {pdfAnalysis.summary}
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgb(55, 53, 47)',
                mb: 2
              }}>
                Puntos Clave:
              </Typography>
              <List sx={{ mb: 3 }}>
                {pdfAnalysis.keyPoints.map((point: string, index: number) => (
                  <ListItem key={index} sx={{ 
                    py: 0.5,
                    px: 0
                  }}>
                    <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ 
                          fontSize: '14px',
                          color: 'rgb(55, 53, 47)',
                          lineHeight: 1.5
                        }}>
                          • {point}
                        </Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ 
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgb(55, 53, 47)',
                  mb: 1
                }}>
                  Tags:
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1 
                }}>
                  {pdfAnalysis.tags.map((tag: string, index: number) => (
                    <Chip
                      key={index}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(55, 53, 47, 0.06)',
                        color: 'rgb(55, 53, 47)',
                        fontSize: '12px',
                        height: '24px',
                        '&:hover': {
                          backgroundColor: 'rgba(55, 53, 47, 0.08)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          bgcolor: '#fbfbfa',
          borderTop: '1px solid rgba(55, 53, 47, 0.09)',
        }}>
          <Button 
            onClick={() => setShowPdfDialog(false)}
            sx={{
              color: 'rgb(55, 53, 47)',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(55, 53, 47, 0.08)',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateFromPDF}
            disabled={!pdfAnalysis}
            variant="contained"
            sx={{
              backgroundColor: '#2ecc71',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#27ae60',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(46, 204, 113, 0.3)',
              }
            }}
          >
            Crear Página
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AISearch; 