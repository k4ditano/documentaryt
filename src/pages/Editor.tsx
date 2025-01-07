import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IconButton,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import BlockNoteEditor from '../components/editor/BlockNoteEditor';
import { styled } from '@mui/material/styles';
import { storageService } from '../services/storageService';
import MainLayout from '../components/layout/MainLayout';
import '../styles/editor.css';
import '../styles/blocknote-editor.css';

const defaultContent = [{
  id: crypto.randomUUID(),
  type: "paragraph",
  content: [{
    type: "text",
    text: "Comienza a escribir...",
    styles: {}
  }],
}];

const EditorContainer = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #ffffff;
`;

const MainContent = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TopBar = styled('div')`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(55, 53, 47, 0.09);
  gap: 8px;
  min-height: 45px;
  background-color: #ffffff;

  @media (max-width: 768px) {
    padding: 12px;
    min-height: 56px;

    .MuiIconButton-root {
      padding: 12px;
    }
  }
`;

const ContentContainer = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 32px;
  max-width: 900px;
  margin: 0 auto;
`;

const EditorWrapper = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TitleContainer = styled('div')`
  margin-bottom: 2rem;
  width: 100%;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(55, 53, 47, 0.09);
    transform: scaleY(0.5);
  }

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const TitleInput = styled(TextField)`
  & .MuiInput-root {
    font-size: 2.5rem;
    font-weight: 700;
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
    color: rgb(55, 53, 47);
    &:before, &:after {
      display: none;
    }
    & input {
      padding: 10px 0;
      &:focus {
        background-color: rgba(55, 53, 47, 0.024);
        border-radius: 4px;
      }
      &::placeholder {
        color: rgba(55, 53, 47, 0.2);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      font-size: 1.75rem;
      
      & input {
        padding: 10px 0;
      }
    }
  }
  transition: background-color 100ms ease-in 0s;
  cursor: text;
  width: 100%;
  margin-top: 1.5rem;
  &:hover {
    background-color: rgba(55, 53, 47, 0.03);
    border-radius: 4px;
  }
`;

const Editor: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updatePage } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string | null>(null);
  const lastSavedTitleRef = useRef<string>('');

  // Cargar la página inicialmente
  useEffect(() => {
    const loadPage = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const page = await storageService.getPage(id);
        setTitle(page.title || '');
        lastSavedTitleRef.current = page.title || '';
        
        // Asegurarse de que el contenido sea un string válido
        const pageContent = typeof page.content === 'string' 
          ? page.content 
          : JSON.stringify(page.content || defaultContent);
        
        setContent(pageContent);
        lastSavedContentRef.current = pageContent;
        
        console.log('Página cargada:', {
          id: page.id,
          title: page.title,
          content: JSON.parse(pageContent),
          contentLength: pageContent.length
        });
      } catch (error) {
        console.error('Error al cargar la página:', error);
        // Establecer contenido por defecto si hay error
        setContent(JSON.stringify(defaultContent));
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [id]);

  // Función unificada de guardado automático
  const autoSave = useCallback(async (newTitle: string, newContent: string) => {
    if (!id) return;

    try {
      const parsedContent = JSON.parse(newContent);
      console.log('Guardando contenido:', {
        title: newTitle,
        content: parsedContent,
        length: newContent.length,
        currentSaved: lastSavedContentRef.current
      });

      const updatedPage = await updatePage(id, {
        title: newTitle,
        content: newContent
      });

      if (updatedPage) {
        const returnedContent = typeof updatedPage.content === 'string' 
          ? updatedPage.content 
          : JSON.stringify(updatedPage.content);

        // Actualizar referencias y estado
        lastSavedContentRef.current = returnedContent;
        lastSavedTitleRef.current = updatedPage.title;
        setContent(returnedContent);

        console.log('Contenido actualizado:', {
          content: JSON.parse(returnedContent),
          length: returnedContent.length,
          title: updatedPage.title
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }, [id, updatePage]);

  const handleContentChange = useCallback((newContent: string) => {
    if (!id || !newContent) return;

    try {
      const parsedContent = JSON.parse(newContent);
      if (!Array.isArray(parsedContent)) {
        console.error('El contenido debe ser un array');
        return;
      }

      // Solo actualizar si hay cambios reales
      const currentContent = content || lastSavedContentRef.current;
      const hasChanged = newContent !== currentContent;

      console.log('Evaluando cambios:', {
        currentContent,
        newContent,
        hasChanged,
        currentLength: currentContent?.length || 0,
        newLength: newContent.length
      });

      if (hasChanged) {
        setContent(newContent);
        
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          const shouldSave = newContent !== lastSavedContentRef.current;
          console.log('Evaluando guardado:', {
            shouldSave,
            newContent,
            lastSaved: lastSavedContentRef.current
          });

          if (shouldSave) {
            console.log('Iniciando guardado:', {
              content: parsedContent,
              length: newContent.length
            });
            autoSave(title, newContent);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error al procesar el contenido:', error);
    }
  }, [id, title, content, autoSave]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    
    // Solo actualizar el estado si el título es diferente
    if (newTitle !== title) {
      setTitle(newTitle);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (content && newTitle !== lastSavedTitleRef.current) {
          console.log('Iniciando guardado por cambio de título...');
          autoSave(newTitle, content);
        }
      }, 500);
    }
  }, [content, autoSave, title]);

  const handleBack = () => {
    navigate(-1);
  };

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <MainLayout>
      <EditorContainer>
        <MainContent>
          <TopBar>
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          </TopBar>
          <ContentContainer>
            <EditorWrapper>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TitleContainer>
                    <TitleInput
                      variant="standard"
                      placeholder="Sin título"
                      value={title}
                      onChange={handleTitleChange}
                      fullWidth
                    />
                  </TitleContainer>
                  {content !== null && (
                    <BlockNoteEditor
                      content={content}
                      onChange={handleContentChange}
                    />
                  )}
                </>
              )}
            </EditorWrapper>
          </ContentContainer>
        </MainContent>
      </EditorContainer>
    </MainLayout>
  );
};

export default Editor; 