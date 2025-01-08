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

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prevMessages => [...prevMessages, message]);
  };

  const handleChatSearch = async () => {
    if (!currentMessage.trim()) return;
    
    setLoading(true);
    
    const originalMessage = currentMessage;
    setCurrentMessage('');
    
    const userMessage: UserMessage = {
        type: 'user',
        content: originalMessage,
        timestamp: new Date()
    };
    addChatMessage(userMessage);
    
    try {
        const freshPages = await storageService.getPages();
        
        const previousSearchResults = chatMessages
            .filter(msg => msg.type === 'search')
            .map(msg => (msg as SearchMessage).content)
            .flat();

        const searchResults = await geminiService.searchContent(originalMessage, freshPages, previousSearchResults);
        
        const aiResponse = await geminiService.generateChatResponse(
            originalMessage,
            searchResults.results,
            previousSearchResults
        );
        
        if (aiResponse.includes('[EXTERNAL]')) {
            const cleanResponse = aiResponse.replace('[EXTERNAL]', '');
            const aiMessage: AIMessage = {
                type: 'ai',
                content: cleanResponse + '\n\n(Esta información proviene de fuentes externas, no de tus documentos)',
                timestamp: new Date()
            };
            addChatMessage(aiMessage);
        } else {
            const aiMessage: AIMessage = {
                type: 'ai',
                content: aiResponse,
                timestamp: new Date()
            };
            addChatMessage(aiMessage);

            if (searchResults.results.length > 0) {
                const searchMessage: SearchMessage = {
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
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        const errorMessage: AIMessage = {
            type: 'ai',
            content: 'Lo siento, ha ocurrido un error al procesar tu consulta.',
            timestamp: new Date()
        };
        addChatMessage(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const freshPages = await storageService.getPages();
      const searchResults = await geminiService.searchContent(query, freshPages);
      setResults(searchResults.results);
      setSuggestedActions(searchResults.suggestedActions || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedAction = async (action: SuggestedAction) => {
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
    } catch (error) {
      console.error('Error al ejecutar la acción sugerida:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
    setSelectedFile(file);
    try {
        const analysis = await pdfService.analyzePDF(file);
      setPdfAnalysis(analysis);
        setShowPdfDialog(true);
    } catch (error) {
      console.error('Error al analizar PDF:', error);
      }
    }
  };

  const handleCreateFromPDF = async () => {
    if (!pdfAnalysis || !selectedFile) return;
    
    try {
      const blocks: Block[] = [
        createBlock(
          "heading",
          pdfAnalysis.suggestedTitle,
          "1",
          { level: 1 }
        ),
        createBlock(
          "paragraph",
          "Resumen:",
          "2",
          {},
          { bold: true }
        ),
        createBlock(
          "paragraph",
          pdfAnalysis.summary,
          "3"
        ),
        createBlock(
          "paragraph",
          "Puntos clave:",
          "4",
          {},
          { bold: true }
        ),
        createBlock(
          "bullet_list",
          pdfAnalysis.keyPoints.join('\n'),
          "5"
        ),
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
    } catch (error) {
      console.error('Error al crear página desde PDF:', error);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    if (result.type === 'page' && result.id) {
      navigate(`/page/${result.id}`);
    }
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'title': return <EditIcon />;
      case 'content': return <SearchIcon />;
      case 'tag': return <LocalOfferIcon />;
      default: return <SearchIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create_page': return <CreateIcon />;
      case 'read_pdf': return <PdfIcon />;
      case 'link_pages': return <LinkIcon />;
      case 'organize_content': return <FolderIcon />;
      case 'add_tags': return <LocalOfferIcon />;
      case 'merge_pages': return <MergeTypeIcon />;
      default: return <CreateIcon />;
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar o hacer una pregunta..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <IconButton 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
        <IconButton
          onClick={() => setChatOpen(true)}
        >
          <ChatIcon />
        </IconButton>
        <input
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
        >
          <PdfIcon />
        </IconButton>
      </Box>

      {showResults && (
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List>
            {results.map((result, index) => (
                            <ListItem 
                key={index}
                button
                              onClick={() => handleResultClick(result)}
                sx={{ mb: 1 }}
                            >
                              <ListItemText
                                primary={
                    <Typography variant="subtitle1">
                                      {getMatchTypeIcon(result.matchType)}
                      <span style={{ marginLeft: 8 }}>{result.title}</span>
                                    </Typography>
                  }
                  secondary={result.excerpt}
                              />
                            </ListItem>
                          ))}
                        </List>

          {suggestedActions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Acciones sugeridas
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedActions.map((action, index) => (
                  <Card
                    key={index}
                        sx={{ 
                      minWidth: 275,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleSuggestedAction(action)}
                  >
                    <CardContent>
                      <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getActionIcon(action.type)}
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                        <Chip
                          size="small"
                          label={action.priority}
                          color={getPriorityColor(action.priority)}
                        />
                        {action.category && (
                          <Chip
                            size="small"
                            label={action.category}
                          />
                        )}
                      </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
          </Box>
          )}
            </Box>
          )}

      <Dialog
        open={showPdfDialog}
        onClose={() => setShowPdfDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Análisis del PDF
          <IconButton
            onClick={() => setShowPdfDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {pdfAnalysis && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                Título sugerido: {pdfAnalysis.suggestedTitle}
                            </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Resumen
                          </Typography>
              <Typography variant="body1">
                {pdfAnalysis.summary}
                            </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Puntos clave
                            </Typography>
              <List>
                {pdfAnalysis.keyPoints.map((point, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={point} />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Etiquetas sugeridas
                          </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {pdfAnalysis.tags.map((tag, index) => (
                    <Chip key={index} label={tag} />
                  ))}
                </Box>
              </Box>
                            </Box>
                          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPdfDialog(false)}>
            Cancelar
          </Button>
                    <Button
            onClick={handleCreateFromPDF}
            variant="contained"
            color="primary"
          >
            Crear página
                    </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chat con AI
          <IconButton
            onClick={() => setChatOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ 
              height: '60vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                mb: 2,
                p: 2
              }}
            >
              {chatMessages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  {message.type === 'search' ? (
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="text.secondary">
                        Fuentes relacionadas:
              </Typography>
                      <List>
                        {message.content.map((result, resultIndex) => (
                          <ListItem
                            key={resultIndex}
                            button
                            onClick={() => handleResultClick(result)}
                          >
                    <ListItemText 
                              primary={result.title}
                              secondary={result.excerpt}
                    />
                  </ListItem>
                ))}
              </List>
                    </Box>
                  ) : (
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                        color: message.type === 'user' ? 'primary.contrastText' : 'text.primary'
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              ))}
              <div ref={chatEndRef} />
                </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Escribe tu mensaje..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSearch()}
                multiline
                maxRows={4}
              />
              <IconButton
                onClick={handleChatSearch}
                disabled={loading}
                color="primary"
              >
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
              </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AISearch; 