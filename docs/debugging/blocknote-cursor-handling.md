# Manejo del Cursor en BlockNote Editor

## Problema
Cuando se guarda o actualiza el contenido del editor BlockNote, el cursor puede desplazarse a posiciones incorrectas:
- Al final de la página
- A la primera celda de una tabla
- A la última celda de una tabla
- Crear un nuevo bloque no deseado

## Causa
El editor BlockNote está construido sobre ProseMirror, y cuando se actualiza el contenido, el estado interno del editor puede perderse si no se maneja correctamente la posición del cursor y la selección.

## Solución Implementada

### 1. Estructura para Mantener la Posición
```typescript
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
```

### 2. Guardar la Posición del Cursor
```typescript
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
```

### 3. Restaurar la Posición del Cursor
```typescript
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
```

## Puntos Clave
1. **Estado Interno**: Es necesario acceder al estado interno de ProseMirror para mantener la posición exacta.
2. **Coordenadas de Selección**: Se deben guardar las coordenadas exactas (`from`, `to`, `anchor`, `head`).
3. **Timing**: Usar `requestAnimationFrame` para asegurar que el DOM está actualizado antes de restaurar la posición.
4. **Manejo de Errores**: Implementar try-catch para manejar posibles errores en la restauración.

## Consideraciones
- El acceso al estado interno del editor requiere usar `@ts-ignore` ya que son APIs internas.
- La solución funciona tanto para texto normal como para tablas.
- No interfiere con el funcionamiento normal del editor.
- Mantiene la experiencia de usuario fluida sin saltos del cursor.

## Referencias
- [Documentación de BlockNote - Cursor & Selections](https://www.blocknotejs.org/docs/editor-api/cursor-selections)
- [Documentación de BlockNote - Default Schema](https://www.blocknotejs.org/docs/editor-basics/default-schema#default-blocks)
- [ProseMirror State Documentation](https://prosemirror.net/docs/ref/#state) 