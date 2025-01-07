# Manejo de Campos JSON en SQLite

## Problema
Cuando se almacenan campos JSON en SQLite (como arrays o objetos) y se recuperan a través de una API REST, pueden surgir problemas de parseo si no se manejan correctamente en todas las rutas del backend.

### Síntomas
- Los datos se guardan correctamente en la base de datos
- Los datos se muestran correctamente inmediatamente después de guardar
- Los datos aparecen como string después de recargar la página
- Los datos no se muestran correctamente en diferentes vistas de la misma información

### Causa
SQLite almacena los campos JSON como texto (STRING). Cuando se recuperan estos datos:
1. Se necesita parsear explícitamente el string JSON a un objeto/array JavaScript
2. Si no se parsea, se enviará como string al frontend
3. El frontend esperará un array/objeto, no un string

## Solución

### 1. Al Guardar Datos
Siempre usar `JSON.stringify()` al guardar campos JSON en la base de datos:

```javascript
await db.runAsync(
    `UPDATE tasks SET linked_pages = ? WHERE id = ?`,
    [
        JSON.stringify(Array.isArray(linked_pages) ? linked_pages : []),
        taskId
    ]
);
```

### 2. Al Recuperar Datos
Parsear los campos JSON antes de enviar la respuesta:

```javascript
// Para un solo registro
const task = await db.getAsync('SELECT * FROM tasks WHERE id = ?', [taskId]);
if (task) {
    task.linked_pages = JSON.parse(task.linked_pages || '[]');
}

// Para múltiples registros
const tasks = await db.allAsync('SELECT * FROM tasks');
const parsedTasks = tasks.map(task => ({
    ...task,
    linked_pages: task.linked_pages ? JSON.parse(task.linked_pages) : []
}));
```

### 3. Puntos Importantes
- Asegurarse de parsear en TODAS las rutas que devuelven datos
- Manejar casos donde el campo puede ser null o undefined
- Usar try-catch al parsear para manejar JSON inválido
- Proporcionar un valor por defecto (ej: `[]` para arrays)

## Ejemplo de Implementación

```javascript
// Ruta GET para obtener registros
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tasks = await db.allAsync(
            `SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC`,
            [req.user.id]
        );
        
        // Parsear las páginas enlazadas para cada tarea
        const parsedTasks = tasks.map(task => ({
            ...task,
            linked_pages: task.linked_pages ? JSON.parse(task.linked_pages) : []
        }));
        
        res.json(parsedTasks || []);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});
```

## Lista de Verificación
- [ ] ¿Se usa `JSON.stringify()` al guardar?
- [ ] ¿Se usa `JSON.parse()` al recuperar?
- [ ] ¿Se maneja el parseo en todas las rutas relevantes?
- [ ] ¿Se manejan los casos de error?
- [ ] ¿Se proporcionan valores por defecto? 