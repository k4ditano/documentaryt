# Alineación del Editor con el Título

## Problema
El contenido del editor BlockNote no está alineado verticalmente con el título de la página, creando una inconsistencia visual en la interfaz.

## Causa
El editor BlockNote tiene márgenes o padding por defecto que no coinciden con la alineación del título de la página.

## Solución

### 1. Ajustar el CSS del Editor
```css
.bn-container {
  margin-top: 0;
  padding-top: 0;
}

.bn-editor {
  margin-top: 0;
}
```

### 2. Alinear el Contenedor Principal
```css
.page-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.page-title,
.editor-container {
  margin-left: 0;
  padding-left: 0;
}
```

## Puntos Clave
1. **Eliminar Márgenes**: Remover márgenes y padding innecesarios del editor.
2. **Alineación Consistente**: Asegurar que tanto el título como el editor compartan la misma alineación izquierda.
3. **Contenedor Flexible**: Usar flexbox para mantener una alineación consistente.

## Consideraciones
- Los estilos deben aplicarse de manera que no afecten otros componentes.
- Mantener la responsividad del diseño.
- Asegurar que la alineación se mantenga en diferentes tamaños de pantalla.

## Implementación
1. Identificar las clases CSS del editor BlockNote
2. Aplicar los estilos necesarios para alinear el contenido
3. Verificar que la alineación se mantiene al redimensionar la ventana
4. Comprobar que no hay efectos secundarios en otros componentes 