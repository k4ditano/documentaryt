import { FC, useEffect, useState, useRef } from 'react';
import { useBlockNote } from '@blocknote/react';
import { BlockNoteView, Theme, darkDefaultTheme, lightDefaultTheme } from '@blocknote/mantine';
import { Block, BlockSchema, DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema } from '@blocknote/core';
import '@blocknote/core/style.css';
import '@blocknote/mantine/style.css';

// Estilos globales para el editor
const styles = `
  .bn-container {
    height: 100%;
    outline: none !important;
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
  }
  
  /* Estilos del menú desplegable */
  .bn-menu {
    background: white;
    border-radius: 4px;
    box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
    overflow: hidden;
  }

  .bn-menu-item {
    padding: 6px 12px;
    margin: 0;
    cursor: pointer;
    color: rgb(55, 53, 47);
    font-size: 14px;
    line-height: 1.5;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bn-menu-item:hover {
    background: rgba(55, 53, 47, 0.08);
  }

  /* Estilos de los botones */
  .bn-button {
    background: transparent;
    border: none;
    border-radius: 3px;
    color: rgba(55, 53, 47, 0.65);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    width: 24px;
    transition: background-color 20ms ease-in 0s;
  }

  .bn-button:hover {
    background: rgba(55, 53, 47, 0.08);
  }

  .bn-button.active {
    color: rgb(46, 170, 220);
    background: rgba(46, 170, 220, 0.1);
  }

  /* Estilos del botón de agregar bloque */
  .bn-add-block {
    opacity: 0;
    transition: opacity 100ms ease-in;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: white;
    border: 1px solid rgba(55, 53, 47, 0.16);
    border-radius: 50%;
    color: rgb(55, 53, 47);
    cursor: pointer;
  }

  .bn-add-block::before {
    content: "+";
    font-size: 20px;
    line-height: 0;
    font-family: system-ui;
  }

  .bn-block-content-container {
    position: relative;
  }

  .bn-block-content-container:hover .bn-add-block {
    opacity: 1;
  }

  .bn-add-block:hover {
    background: rgba(55, 53, 47, 0.08);
  }

  /* Estilos del toolbar */
  .bn-toolbar {
    position: absolute;
    z-index: 1;
    display: flex;
    background: white;
    border-radius: 4px;
    box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
    padding: 4px;
    gap: 2px;
  }

  /* Estilos para el contenedor de bloques */
  .bn-block-container {
    position: relative;
    padding: 3px 0;
  }

  .bn-block-container:hover {
    background: rgba(55, 53, 47, 0.03);
  }

  .bn-block-container:hover .bn-add-block {
    opacity: 1;
  }

  /* Resto de estilos existentes */
  .bn-container [contenteditable="true"] {
    outline: none !important;
    padding: 0;
    color: rgb(55, 53, 47);
  }
  
  .bn-container [contenteditable="true"] p {
    margin: 0;
    min-height: 1.5em;
    padding: 3px 2px;
    line-height: 1.5;
    font-size: 16px;
  }

  .bn-container [contenteditable="true"] h1 {
    font-size: 1.875em;
    margin-top: 1.4em;
    margin-bottom: 0.3em;
    font-weight: 600;
    line-height: 1.3;
    color: rgb(55, 53, 47);
  }

  .bn-container [contenteditable="true"] h2 {
    font-size: 1.5em;
    margin-top: 1.3em;
    margin-bottom: 0.3em;
    font-weight: 600;
    line-height: 1.3;
    color: rgb(55, 53, 47);
  }

  .bn-container [contenteditable="true"] h3 {
    font-size: 1.25em;
    margin-top: 1.2em;
    margin-bottom: 0.3em;
    font-weight: 600;
    line-height: 1.3;
    color: rgb(55, 53, 47);
  }

  .bn-container [contenteditable="true"] ul,
  .bn-container [contenteditable="true"] ol {
    margin: 0.2em 0;
    padding-left: 1.5em;
  }

  .bn-container [contenteditable="true"] li {
    padding: 0.2em 0;
    line-height: 1.5;
  }

  .bn-container [contenteditable="true"] blockquote {
    margin: 0.5em 0;
    padding-left: 1em;
    border-left: 3px solid rgba(55, 53, 47, 0.16);
    color: rgba(55, 53, 47, 0.8);
  }

  .bn-container [contenteditable="true"] code {
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 85%;
    background: rgba(135, 131, 120, 0.15);
    color: rgb(55, 53, 47);
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  .bn-container [contenteditable="true"] pre {
    background: rgb(247, 246, 243);
    padding: 1em;
    border-radius: 3px;
    margin: 0.5em 0;
    overflow-x: auto;
  }

  .bn-container [contenteditable="true"] img {
    max-width: 100%;
    height: auto;
    margin: 0.5em 0;
    border-radius: 3px;
  }

  .bn-container [contenteditable="true"] hr {
    border: none;
    border-top: 1px solid rgba(55, 53, 47, 0.16);
    margin: 2em 0;
  }

  .bn-container [contenteditable="true"] a {
    color: rgb(35, 131, 226);
    text-decoration: underline;
    text-decoration-color: rgba(35, 131, 226, 0.4);
  }

  .bn-container [contenteditable="true"] a:hover {
    text-decoration-color: rgb(35, 131, 226);
  }

  .bn-container [contenteditable="true"]:focus-within {
    background: transparent;
  }

  .bn-container [contenteditable="true"] *::selection {
    background: rgba(35, 131, 226, 0.2);
  }

  /* Estilos específicos del menú de tipos de bloques */
  .tippy-box {
    background: white !important;
    color: rgb(55, 53, 47) !important;
    border-radius: 4px !important;
    box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px !important;
    padding: 6px 4px !important;
    max-width: 280px !important;
  }

  .tippy-content {
    padding: 0 !important;
  }

  .tippy-box[data-placement^='bottom'] > .tippy-arrow::before {
    border-bottom-color: white !important;
  }

  .tippy-box[data-placement^='top'] > .tippy-arrow::before {
    border-top-color: white !important;
  }

  /* Estilos de los items del menú */
  .slash-menu-item {
    display: flex !important;
    align-items: center !important;
    padding: 8px 8px !important;
    margin: 0 2px !important;
    border-radius: 3px !important;
    cursor: pointer !important;
    color: rgb(55, 53, 47) !important;
    font-size: 14px !important;
    gap: 8px !important;
  }

  .slash-menu-item:hover {
    background: rgba(55, 53, 47, 0.08) !important;
  }

  .slash-menu-item.selected {
    background: rgba(55, 53, 47, 0.08) !important;
  }

  .slash-menu-item-icon {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 24px !important;
    height: 24px !important;
    color: rgba(55, 53, 47, 0.8) !important;
  }

  .slash-menu-item-title {
    font-weight: 500 !important;
    flex: 1 !important;
  }

  .slash-menu-item-description {
    color: rgba(55, 53, 47, 0.5) !important;
    font-size: 12px !important;
  }

  /* Grupos del menú */
  .slash-menu-group {
    padding: 4px 0 !important;
  }

  .slash-menu-group:not(:last-child) {
    border-bottom: 1px solid rgba(55, 53, 47, 0.1) !important;
  }

  .slash-menu-group-title {
    padding: 4px 12px !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    text-transform: uppercase !important;
    color: rgba(55, 53, 47, 0.5) !important;
    letter-spacing: 0.04em !important;
  }
`;

interface BlockNoteEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const createDefaultBlock = (): Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema> => ({
  id: crypto.randomUUID(),
  type: "paragraph",
  content: [{
    type: "text",
    text: "Comienza a escribir...",
    styles: {}
  }],
  props: {
    textAlignment: "left",
    backgroundColor: "default",
    textColor: "default"
  },
  children: []
});

type CursorPosition = {
  block: Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
  prevBlock?: Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
  nextBlock?: Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
  internalSelection?: {
    from: number;
    to: number;
    anchor: number;
    head: number;
  };
};

const notionLightTheme = {
  colors: {
    editor: {
      text: "rgb(55, 53, 47)",
      background: "#ffffff",
    },
    menu: {
      text: "rgb(55, 53, 47)",
      background: "#ffffff",
    },
    tooltip: {
      text: "rgb(55, 53, 47)",
      background: "#ffffff",
    },
    hovered: {
      text: "rgb(55, 53, 47)",
      background: "rgba(55, 53, 47, 0.08)",
    },
    selected: {
      text: "#ffffff",
      background: "rgb(46, 170, 220)",
    },
    disabled: {
      text: "rgba(55, 53, 47, 0.3)",
      background: "rgba(55, 53, 47, 0.05)",
    },
    shadow: "rgba(15, 15, 15, 0.1)",
    border: "rgba(55, 53, 47, 0.16)",
    sideMenu: "rgba(55, 53, 47, 0.5)",
    highlights: lightDefaultTheme.colors!.highlights,
  },
  borderRadius: 4,
  fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
} satisfies Theme;

const notionDarkTheme = {
  colors: {
    editor: {
      text: "#ffffff",
      background: "#191919",
    },
    menu: {
      text: "#ffffff",
      background: "#2D2D2D",
    },
    tooltip: {
      text: "#ffffff",
      background: "#2D2D2D",
    },
    hovered: {
      text: "#ffffff",
      background: "rgba(255, 255, 255, 0.1)",
    },
    selected: {
      text: "#ffffff",
      background: "rgb(46, 170, 220)",
    },
    disabled: {
      text: "rgba(255, 255, 255, 0.3)",
      background: "rgba(255, 255, 255, 0.05)",
    },
    shadow: "rgba(15, 15, 15, 0.2)",
    border: "rgba(255, 255, 255, 0.16)",
    sideMenu: "rgba(255, 255, 255, 0.5)",
    highlights: darkDefaultTheme.colors!.highlights,
  },
  borderRadius: 4,
  fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
} satisfies Theme;

const notionTheme = {
  light: notionLightTheme,
  dark: notionDarkTheme,
};

const BlockNoteEditor: FC<BlockNoteEditorProps> = ({ content, onChange }) => {
  const [initialContent, setInitialContent] = useState<Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>[]>([createDefaultBlock()]);
  const lastSavedContentRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoadRef = useRef(true);
  const isUpdatingRef = useRef(false);
  const lastChangeTimeRef = useRef<number>(0);
  const cursorPositionRef = useRef<CursorPosition | null>(null);

  // Agregar estilos globales al montar
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Parsear el contenido inicial
  useEffect(() => {
    if (!content) return;

    try {
      const parsedContent = JSON.parse(content);
      console.log('Contenido parseado:', parsedContent);

      if (Array.isArray(parsedContent) && parsedContent.length > 0) {
        // Asegurarse de que cada bloque tenga la estructura correcta
        const validBlocks = parsedContent.map(block => {
          console.log('Procesando bloque:', block);

          if (block.type === "table") {
            console.log('Procesando tabla:', block);

            // Usar el contenido existente de la tabla si está disponible
            if (block.content) {
              console.log('Contenido de tabla existente:', block.content);

              // Si el contenido ya tiene el formato correcto
              if (block.content.type === "tableContent") {
                return {
                  id: block.id || crypto.randomUUID(),
                  type: "table" as const,
                  content: block.content,
                  props: {
                    textAlignment: block.props?.textAlignment || "left",
                    backgroundColor: block.props?.backgroundColor || "default",
                    textColor: block.props?.textColor || "default"
                  },
                  children: []
                } as unknown as Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
              }

              // Si el contenido está en el formato antiguo (array)
              if (Array.isArray(block.content)) {
                const tableContent = {
                  type: "tableContent",
                  rows: block.content.map((row: { content: Array<{ content: any; styles?: any }> }) => ({
                    cells: row.content.map((cell: { content: any; styles?: any }) => 
                      Array.isArray(cell.content) ? cell.content : [{
                        type: "text",
                        text: cell.content || "",
                        styles: cell.styles || {}
                      }]
                    )
                  }))
                };

                return {
                  id: block.id || crypto.randomUUID(),
                  type: "table" as const,
                  content: tableContent,
                  props: {
                    textAlignment: block.props?.textAlignment || "left",
                    backgroundColor: block.props?.backgroundColor || "default",
                    textColor: block.props?.textColor || "default"
                  },
                  children: []
                } as unknown as Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
              }
            }

            // Si no hay contenido existente, crear una tabla por defecto
            const rows = block.props?.rows || 2;
            const cols = block.props?.cols || 3;
            console.log(`Creando nueva tabla de ${rows}x${cols}`);

            const tableContent = {
              type: "tableContent",
              rows: Array.from({ length: rows }, () => ({
                cells: Array.from({ length: cols }, () => [{
                  type: "text",
                  text: "",
                  styles: {}
                }])
              }))
            };

            return {
              id: block.id || crypto.randomUUID(),
              type: "table" as const,
              content: tableContent,
              props: {
                textAlignment: block.props?.textAlignment || "left",
                backgroundColor: block.props?.backgroundColor || "default",
                textColor: block.props?.textColor || "default"
              },
              children: []
            } as unknown as Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
          }

          // Para bloques que no son tablas
          const blockContent = Array.isArray(block.content) ? block.content : [];
          console.log('Contenido del bloque:', blockContent);

          return {
            id: block.id || crypto.randomUUID(),
            type: block.type || "paragraph",
            content: blockContent.map((content: any) => ({
              type: content.type || "text" as const,
              text: content.text || "",
              styles: content.styles || {}
            })),
            props: {
              textAlignment: block.props?.textAlignment || "left",
              backgroundColor: block.props?.backgroundColor || "default",
              textColor: block.props?.textColor || "default"
            },
            children: block.children || []
          } as Block<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
        });
        
        console.log('Bloques validados:', validBlocks);
        setInitialContent(validBlocks);
        lastSavedContentRef.current = content;
        isInitialLoadRef.current = true;
      }
    } catch (error) {
      console.error('Error al parsear contenido inicial:', error);
      console.error('Contenido que causó el error:', content);
      setInitialContent([createDefaultBlock()]);
    }
  }, [content]);

  const editor = useBlockNote({
    initialContent: initialContent
  });

  // Manejar cambios en el editor
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      if (isUpdatingRef.current) return;

      try {
        const blocks = editor.topLevelBlocks;
        console.log('Bloques actuales:', blocks);

        // Procesar los bloques antes de guardarlos
        const processedBlocks = blocks.map(block => {
          if (block.type === "table") {
            console.log('Guardando tabla:', block);
            return {
              ...block,
              content: block.content
            };
          }
          return block;
        });

        const contentString = JSON.stringify(processedBlocks);
        console.log('Contenido a guardar:', contentString);
        
        // No procesar cambios durante la carga inicial
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          return;
        }

        // Comparar con el último contenido guardado
        const currentContent = lastSavedContentRef.current;
        const hasChanged = currentContent !== contentString;
        
        if (hasChanged) {
          // Verificar el tiempo desde el último cambio
          const now = Date.now();
          const timeSinceLastChange = now - lastChangeTimeRef.current;
          
          if (timeSinceLastChange < 100) return;
          
          lastChangeTimeRef.current = now;

          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          // Guardar la posición exacta del cursor
          const cursorPosition = editor.getTextCursorPosition();
          if (cursorPosition) {
            // @ts-ignore - Acceder al estado interno del editor
            const internalState = editor._tiptapEditor?.state.selection;
            const internalSelection = internalState ? {
              from: internalState.from,
              to: internalState.to,
              anchor: internalState.anchor,
              head: internalState.head
            } : undefined;

            cursorPositionRef.current = {
              block: cursorPosition.block,
              prevBlock: cursorPosition.prevBlock,
              nextBlock: cursorPosition.nextBlock,
              internalSelection
            };
          }

          saveTimeoutRef.current = setTimeout(async () => {
            try {
              const savedPosition = cursorPositionRef.current;
              isUpdatingRef.current = true;
              
              // Guardar el contenido
              await onChange(contentString);
              lastSavedContentRef.current = contentString;

              // Restaurar la posición del cursor
              if (savedPosition?.internalSelection) {
                const { from, to } = savedPosition.internalSelection;
                requestAnimationFrame(() => {
                  // @ts-ignore - Acceder al estado interno del editor
                  const view = editor._tiptapEditor?.view;
                  if (view?.state) {
                    try {
                      const { state } = view;
                      const tr = state.tr;
                      // @ts-ignore - Acceder a la API interna de ProseMirror
                      tr.setSelection(state.selection.constructor.create(state.doc, from, to));
                      view.dispatch(tr);
                      view.focus();
                    } catch (error) {
                      console.log('Error al restaurar la selección:', error);
                    }
                  }
                });
              }
              
              isUpdatingRef.current = false;
            } catch (error) {
              console.error('Error al guardar:', error);
              isUpdatingRef.current = false;
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error al procesar cambios:', error);
      }
    };

    editor.onEditorContentChange(handleChange);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, onChange]);

  // Actualizar contenido cuando cambia externamente
  useEffect(() => {
    if (!editor || !initialContent.length || isUpdatingRef.current) return;

    try {
      const savedPosition = cursorPositionRef.current;
      isUpdatingRef.current = true;

      // Actualizar el contenido
      editor.replaceBlocks(editor.topLevelBlocks, initialContent);
      lastSavedContentRef.current = JSON.stringify(initialContent);

      // Restaurar la posición del cursor
      if (savedPosition?.internalSelection) {
        const { from, to } = savedPosition.internalSelection;
        requestAnimationFrame(() => {
          // @ts-ignore - Acceder al estado interno del editor
          const view = editor._tiptapEditor?.view;
          if (view?.state) {
            try {
              const { state } = view;
              const tr = state.tr;
              // @ts-ignore - Acceder a la API interna de ProseMirror
              tr.setSelection(state.selection.constructor.create(state.doc, from, to));
              view.dispatch(tr);
              view.focus();
            } catch (error) {
              console.log('Error al restaurar la selección:', error);
            }
          }
        });
      }

      isUpdatingRef.current = false;
      isInitialLoadRef.current = false;
    } catch (error) {
      console.error('Error al actualizar contenido:', error);
      isUpdatingRef.current = false;
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  return (
    <div style={{ flex: 1, position: 'relative', height: '100%' }} className="bn-container">
      <BlockNoteView editor={editor} theme={notionLightTheme} />
    </div>
  );
};

export default BlockNoteEditor; 