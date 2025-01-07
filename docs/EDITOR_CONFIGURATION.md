# Configuración del Editor

## Componentes Principales

### BlockNoteEditor

El componente principal del editor está configurado con las siguientes características clave:

#### Gestión del Cursor
```typescript
interface CursorPosition {
  blockId: string;
  blockIndex: number;
}
```

#### Referencias Importantes
```typescript
const lastSavedContentRef = useRef<string>('');
const saveTimeoutRef = useRef<NodeJS.Timeout>();
const isInitialLoadRef = useRef(true);
const isUpdatingRef = useRef(false);
const lastChangeTimeRef = useRef<number>(0);
const cursorPositionRef = useRef<CursorPosition | null>(null);
```

#### Estilos Globales
Los estilos están diseñados para emular la experiencia de Notion:

```css
/* Contenedor principal */
.bn-container {
  height: 100%;
  outline: none !important;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif;
}

/* Área editable */
.bn-container [contenteditable="true"] {
  outline: none !important;
  padding: 0;
  color: rgb(55, 53, 47);
}

/* Párrafos */
.bn-container [contenteditable="true"] p {
  margin: 0;
  min-height: 1.5em;
  padding: 3px 2px;
  line-height: 1.5;
  font-size: 16px;
}

/* Encabezados */
.bn-container [contenteditable="true"] h1 {
  font-size: 1.875em;
  margin-top: 1.4em;
  margin-bottom: 0.3em;
  font-weight: 600;
}

/* Listas */
.bn-container [contenteditable="true"] ul,
.bn-container [contenteditable="true"] ol {
  margin: 0.2em 0;
  padding-left: 1.5em;
}

/* Citas */
.bn-container [contenteditable="true"] blockquote {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid rgba(55, 53, 47, 0.16);
  color: rgba(55, 53, 47, 0.8);
}

/* Código */
.bn-container [contenteditable="true"] code {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  background: rgba(135, 131, 120, 0.15);
  border-radius: 3px;
}

/* Enlaces */
.bn-container [contenteditable="true"] a {
  color: rgb(35, 131, 226);
  text-decoration-color: rgba(35, 131, 226, 0.4);
}

/* Selección de texto */
.bn-container [contenteditable="true"] *::selection {
  background: rgba(35, 131, 226, 0.2);
}
```

#### Estilos de la Interfaz
```css
/* Menú desplegable */
.bn-menu {
  background: white;
  border-radius: 4px;
  box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px;
}

/* Elementos del menú */
.bn-menu-item {
  padding: 6px 12px;
  color: rgb(55, 53, 47);
  font-size: 14px;
}

/* Botones */
.bn-button {
  background: transparent;
  color: rgba(55, 53, 47, 0.65);
  height: 24px;
  width: 24px;
}

/* Botón de agregar bloque */
.bn-add-block-button {
  background: white;
  border: 1px solid rgba(55, 53, 47, 0.16);
  border-radius: 50%;
}

/* Toolbar */
.bn-toolbar {
  background: white;
  border-radius: 4px;
  box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px;
}
```

## Funcionalidades Críticas

### Guardado Automático
- Intervalo de guardado: 500ms
- Validación de cambios antes de guardar
- Prevención de guardados duplicados

### Manejo del Cursor
1. Guardar posición antes de actualizar:
```typescript
const cursorPosition = editor.getTextCursorPosition();
if (cursorPosition) {
  const blockIndex = blocks.findIndex(b => b.id === cursorPosition.block.id);
  if (blockIndex !== -1) {
    cursorPositionRef.current = {
      blockId: cursorPosition.block.id,
      blockIndex
    };
  }
}
```

2. Restaurar posición después de actualizar:
```typescript
if (cursorPositionRef.current) {
  const { blockId } = cursorPositionRef.current;
  const block = editor.getBlock(blockId);
  if (block) {
    editor.focus();
    editor.setTextCursorPosition(block, "end");
  }
}
```

### Validación de Contenido
```typescript
const validBlocks = parsedContent.map(block => ({
  id: block.id || crypto.randomUUID(),
  type: block.type || "paragraph",
  content: Array.isArray(block.content) ? block.content : [{
    type: "text",
    text: block.text || "",
    styles: {}
  }],
  props: {
    textAlignment: block.props?.textAlignment || "left",
    backgroundColor: block.props?.backgroundColor || "default",
    textColor: block.props?.textColor || "default"
  },
  children: block.children || []
}));
```

## Problemas Resueltos

1. **Pérdida de Foco**: Implementado sistema de seguimiento del cursor
2. **Guardado Inconsistente**: Mejorado sistema de validación y timing
3. **Desplazamiento no Deseado**: Corregido con manejo apropiado del cursor
4. **Contenido Inicial**: Implementada validación robusta del contenido
5. **Diseño Visual**: Implementado estilo tipo Notion con tipografía y espaciado consistentes

## Mejores Prácticas

1. Siempre validar el contenido antes de guardarlo
2. Mantener referencias al último contenido guardado
3. Implementar debounce en operaciones de guardado
4. Preservar la posición del cursor durante actualizaciones
5. Manejar errores en la carga inicial de contenido
6. Mantener consistencia visual con el diseño de Notion

## Notas Importantes

- El tiempo de guardado automático está configurado a 500ms para balance entre responsividad y rendimiento
- La validación de contenido es crucial para prevenir errores de formato
- El manejo del cursor es fundamental para una buena experiencia de usuario
- Los estilos están diseñados para emular la experiencia de Notion, manteniendo la consistencia visual 