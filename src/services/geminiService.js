import { GoogleGenerativeAI } from '@google/generative-ai';
import { taskService } from './taskService';
import { storageService } from './storageService';
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
let lastAction = {
    type: null,
    details: null,
    confirmed: false,
    suggestions: []
};
export const generateSuggestions = async (content) => {
    try {
        const prompt = `
      Basado en el siguiente contenido:
      "${content}"
      
      Genera 3 sugerencias relevantes para expandir o mejorar el contenido.
      Responde solo con las sugerencias, una por línea, sin numeración ni puntos.
    `;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return text.split('\n').filter((line) => line.trim());
    }
    catch (error) {
        console.error('Error al generar sugerencias:', error);
        return [];
    }
};
export const generateSummary = async (content) => {
    try {
        const prompt = `
      Resume el siguiente contenido en un párrafo conciso:
      "${content}"
    `;
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    }
    catch (error) {
        console.error('Error al generar resumen:', error);
        return '';
    }
};
export const analyzeContent = async (content) => {
    try {
        const prompt = `
      Analiza el siguiente contenido:
      "${content}"
      
      Proporciona:
      1. Palabras clave principales (máximo 5)
      2. Temas principales (máximo 3)
      3. Entidades mencionadas (personas, lugares, organizaciones)
      
      Responde en formato JSON con las claves: keywords, topics, entities
    `;
        const result = await model.generateContent(prompt);
        const response = result.response;
        return JSON.parse(response.text());
    }
    catch (error) {
        console.error('Error al analizar contenido:', error);
        return {
            keywords: [],
            topics: [],
            entities: [],
        };
    }
};
export const searchContent = async (query, pages, previousResults = []) => {
    try {
        // Extraer términos de búsqueda relevantes y analizar la consulta
        const searchTerms = query.toLowerCase()
            .replace(/buscame\s+/i, '')
            .replace(/busca\s+/i, '')
            .replace(/encuentrame\s+/i, '')
            .replace(/dime\s+/i, '')
            .replace(/cual\s+es\s+/i, '')
            .replace(/cuantas?\s+/i, '')
            .replace(/que\s+/i, '')
            .replace(/en\s+mi\s+espacio\s+de\s+trabajo/i, '')
            .replace(/en\s+mis\s+paginas/i, '')
            .replace(/en\s+mis\s+documentos/i, '')
            .replace(/segun\s+/i, '')
            .trim();
        // Preprocesar las páginas para extraer el texto plano
        const processedPages = pages.map(page => {
            let textContent = '';
            try {
                if (typeof page.content === 'string') {
                    try {
                        const parsedContent = JSON.parse(page.content);
                        if (Array.isArray(parsedContent)) {
                            textContent = parsedContent.map((block) => {
                                if (block.content && Array.isArray(block.content)) {
                                    return block.content.map((c) => c.text || '').join(' ');
                                }
                                else if (block.text) {
                                    return block.text;
                                }
                                return '';
                            }).join('\\n');
                        }
                    }
                    catch (e) {
                        textContent = page.content;
                    }
                }
                else if (Array.isArray(page.content)) {
                    textContent = page.content.map((block) => {
                        if (block.content && Array.isArray(block.content)) {
                            return block.content.map((c) => c.text || '').join(' ');
                        }
                        else if (block.text) {
                            return block.text;
                        }
                        return '';
                    }).join('\\n');
                }
            }
            catch (e) {
                console.error('Error procesando contenido de página:', e);
                textContent = String(page.content || '');
            }
            textContent = textContent
                .replace(/\\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            return {
                id: page.id,
                title: page.title,
                content: textContent,
                updated_at: page.updated_at
            };
        });
        const prompt = `
      Actúa como un sistema avanzado de búsqueda y análisis de información con comprensión contextual.
      
      CONSULTA ORIGINAL: "${query}"
      TÉRMINOS DE BÚSQUEDA PROCESADOS: "${searchTerms}"
      
      CONTEXTO PREVIO:
      ${previousResults.map(result => `
        ID: ${result.pageId}
        Título: ${result.title}
        Fragmento: ${result.snippet}
        Contexto: ${result.context}
        ---
      `).join('\n')}
      
      CONTENIDO A ANALIZAR:
      ${processedPages.map(page => `
        ID: ${page.id}
        Título: ${page.title}
        Contenido: ${page.content}
        Última modificación: ${page.updated_at || 'N/A'}
        ---
      `).join('\n')}
      
      INSTRUCCIONES DETALLADAS:
      1. ANÁLISIS DE LA CONSULTA:
         - Identifica si la consulta se relaciona con el contexto previo
         - Detecta si se solicita más detalles sobre información previa
         - Analiza si la pregunta es una aclaración o seguimiento
      
      2. BÚSQUEDA CONTEXTUAL:
         - Primero busca en el contexto de la conversación previa
         - Luego busca en el contenido completo
         - Relaciona nueva información con datos previos
         - Considera el contexto temporal de la conversación
      
      3. EXTRACCIÓN DE INFORMACIÓN:
         - Extrae datos relevantes del contexto previo y nuevo contenido
         - Conecta información relacionada entre diferentes fuentes
         - Identifica relaciones entre preguntas anteriores y actuales
      
      4. PARA CADA COINCIDENCIA, INCLUYE EN EL JSON:
         - pageId: ID de la página
         - title: Título de la página
         - relevance: Valor entre 0 y 1 (usa 1.0 para coincidencias directas)
         - snippet: Fragmento exacto donde se encontró la información
         - matchType: "exact" (coincidencia directa) o "partial" (información relacionada)
         - category: "content" o "title"
         - context: Descripción detallada del contexto de la información
      
      REGLAS IMPORTANTES:
      1. PRIORIZA coincidencias exactas de fechas y eventos
      2. INCLUYE el contexto completo de la información encontrada
      3. MANTÉN la precisión en las coincidencias
      4. ASEGURA que los snippets contengan la información relevante
      
      Responde SOLO con un objeto JSON válido que contenga TODOS los resultados encontrados.`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text().trim();
        try {
            // Limpiar y validar JSON
            text = text.replace(/```json\s*|\s*```/g, '')
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                .replace(/^\uFEFF/, '')
                .trim();
            if (!text.startsWith('{') || !text.endsWith('}')) {
                return {
                    results: [],
                    suggestedActions: [],
                    filters: {
                        categories: [],
                        tags: [],
                        dateRanges: [],
                        relevanceThreshold: 0.7
                    }
                };
            }
            const parsedResponse = JSON.parse(text);
            return {
                results: Array.isArray(parsedResponse.results) ?
                    parsedResponse.results
                        .filter((result) => result && result.relevance && result.relevance > 0.3)
                        .map((result) => ({
                        pageId: String(result.pageId || ''),
                        title: String(result.title || ''),
                        relevance: Number(result.relevance) || 0,
                        snippet: String(result.snippet || '').trim(),
                        matchType: result.matchType || 'partial',
                        category: result.category || 'content',
                        context: String(result.context || '').trim(),
                        lastModified: result.lastModified || null,
                        suggestion: result.suggestion || null
                    }))
                        .sort((a, b) => b.relevance - a.relevance)
                        .slice(0, 5) : [],
                suggestedActions: [],
                filters: {
                    categories: [],
                    tags: [],
                    dateRanges: [],
                    relevanceThreshold: 0.7
                }
            };
        }
        catch (parseError) {
            console.error('Error parsing response:', parseError);
            console.error('Raw text:', text);
            return {
                results: [],
                suggestedActions: [],
                filters: {
                    categories: [],
                    tags: [],
                    dateRanges: [],
                    relevanceThreshold: 0.7
                }
            };
        }
    }
    catch (error) {
        console.error('Error en búsqueda:', error);
        return {
            results: [],
            suggestedActions: [],
            filters: {
                categories: [],
                tags: [],
                dateRanges: [],
                relevanceThreshold: 0.7
            }
        };
    }
};
export const analyzePDF = async (pdfText) => {
    try {
        const prompt = `Analiza el siguiente texto extraído de un PDF y genera un resumen estructurado. 
    Responde SOLO con un objeto JSON que tenga la siguiente estructura exacta, sin incluir comillas al inicio o final, ni marcadores de código:
    {
      "summary": "Un resumen conciso del contenido",
      "suggestedTitle": "Un título descriptivo basado en el contenido",
      "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
      "tags": ["tag1", "tag2", "tag3"]
    }
    
    Texto del PDF:
    ${pdfText}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Limpiar la respuesta de caracteres no deseados
        const cleanedText = text
            .replace(/^```json\s*/, '') // Eliminar marcador de inicio de JSON
            .replace(/```$/, '') // Eliminar marcador de fin de JSON
            .trim(); // Eliminar espacios en blanco
        try {
            const parsedResponse = JSON.parse(cleanedText);
            // Validar la estructura de la respuesta
            if (!parsedResponse.summary || !parsedResponse.suggestedTitle ||
                !Array.isArray(parsedResponse.keyPoints) || !Array.isArray(parsedResponse.tags)) {
                throw new Error('Respuesta incompleta o mal estructurada');
            }
            return parsedResponse;
        }
        catch (parseError) {
            console.error('Error al parsear la respuesta:', cleanedText);
            throw new Error('Error al parsear la respuesta del modelo');
        }
    }
    catch (error) {
        console.error('Error al analizar PDF:', error);
        throw error;
    }
};
const processTextStyles = (text) => {
    let styles = {};
    let processedText = text;
    // Procesar negrita
    if (text.includes('**')) {
        styles.bold = true;
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '$1');
    }
    // Procesar cursiva
    if (text.includes('_')) {
        styles.italic = true;
        processedText = processedText.replace(/_(.*?)_/g, '$1');
    }
    // Procesar código
    if (text.includes('`')) {
        styles.code = true;
        processedText = processedText.replace(/`(.*?)`/g, '$1');
    }
    return { text: processedText, styles };
};
export const generateContent = async (title) => {
    try {
        const prompt = `
      INSTRUCCIÓN: Genera contenido detallado sobre el siguiente tema.
      
      TEMA: "${title}"
      
      REQUISITOS:
      1. Usa un estilo claro y profesional
      2. Incluye una introducción
      3. Desarrolla secciones principales
      4. Añade ejemplos o datos relevantes
      5. Incluye una conclusión
      6. Usa markdown para la estructura
      
      FORMATO:
      ## [Título]
      [Introducción]
      
      ## Características Principales
      [Contenido]
      
      ## Detalles Importantes
      [Contenido]
      
      ## Ejemplos y Casos
      [Contenido]
      
      ## Conclusión
      [Resumen y cierre]`;
        const result = await model.generateContent(prompt);
        const content = result.response.text().trim();
        // Convertir el contenido markdown a bloques
        const lines = content.split('\n');
        const blocks = [];
        let currentId = 1;
        let inTable = false;
        let tableData = [];
        for (let line of lines) {
            line = line.trim();
            if (!line)
                continue;
            if (line.startsWith('|') && line.endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableData = [];
                }
                const cells = line.split('|')
                    .filter(cell => cell.trim())
                    .map(cell => cell.trim());
                tableData.push(cells);
                continue;
            }
            if (inTable) {
                // Finalizar tabla
                blocks.push({
                    id: String(currentId++),
                    type: "table",
                    content: tableData.map(row => ({
                        type: "tableRow",
                        cells: row.map(cell => ({
                            type: "text",
                            text: cell,
                            styles: {}
                        }))
                    })),
                    props: { textAlignment: "left" }
                });
                inTable = false;
                tableData = [];
                continue;
            }
            if (line.startsWith('##')) {
                blocks.push({
                    id: String(currentId++),
                    type: "heading",
                    content: [{
                            type: "text",
                            text: line.replace('##', '').trim(),
                            styles: {}
                        }],
                    props: { level: 2, textAlignment: "left" }
                });
            }
            else if (line.match(/^\d+\./)) {
                blocks.push({
                    id: String(currentId++),
                    type: "numberedListItem",
                    content: [{
                            type: "text",
                            text: line.replace(/^\d+\./, '').trim(),
                            styles: {}
                        }],
                    props: { textAlignment: "left" }
                });
            }
            else if (line.startsWith('-')) {
                blocks.push({
                    id: String(currentId++),
                    type: "bulletListItem",
                    content: [{
                            type: "text",
                            text: line.replace('-', '').trim(),
                            styles: {}
                        }],
                    props: { textAlignment: "left" }
                });
            }
            else if (line.startsWith('>')) {
                blocks.push({
                    id: String(currentId++),
                    type: "quote",
                    content: [{
                            type: "text",
                            text: line.replace('>', '').trim(),
                            styles: { italic: true }
                        }],
                    props: { textAlignment: "left" }
                });
            }
            else {
                blocks.push({
                    id: String(currentId++),
                    type: "paragraph",
                    content: [{
                            type: "text",
                            text: line,
                            styles: {}
                        }],
                    props: { textAlignment: "left" }
                });
            }
        }
        return JSON.stringify(blocks);
    }
    catch (error) {
        console.error('Error al generar contenido:', error);
        // En caso de error, devolver un bloque de texto simple
        return JSON.stringify([{
                id: "1",
                type: "paragraph",
                content: [{
                        type: "text",
                        text: "Error al generar contenido. Por favor, intenta nuevamente.",
                        styles: {}
                    }],
                props: { textAlignment: "left" }
            }]);
    }
};
// Función auxiliar para procesar fechas
const processDate = (dateStr) => {
    if (!dateStr)
        return null;
    try {
        // Convertir la fecha a objeto Date
        const date = new Date(dateStr);
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            console.error('Fecha inválida:', dateStr);
            return null;
        }
        // Obtener fecha actual
        const now = new Date();
        // Si la fecha es anterior a la actual, ajustar al año siguiente
        if (date < now) {
            date.setFullYear(now.getFullYear() + 1);
        }
        // Si no tiene hora específica, establecer a las 23:59
        if (dateStr.length <= 10) {
            date.setHours(23, 59, 0, 0);
        }
        return date.toISOString();
    }
    catch (error) {
        console.error('Error procesando fecha:', error);
        return null;
    }
};
const formatTaskList = async (tasks) => {
    // Ordenar tareas por prioridad y fecha
    const sortedTasks = [...tasks].sort((a, b) => {
        // Primero por prioridad
        const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        if (priorityDiff !== 0)
            return priorityDiff;
        // Luego por fecha
        if (!a.due_date || !b.due_date)
            return 0;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    // Agrupar por prioridad
    const tasksByPriority = {
        high: [],
        medium: [],
        low: []
    };
    sortedTasks.forEach(task => {
        if (task.priority in tasksByPriority) {
            tasksByPriority[task.priority].push(task);
        }
    });
    // Formatear la lista
    let response = "📋 Aquí están tus próximas tareas organizadas por prioridad:\n\n";
    for (const [priority, tasks] of Object.entries(tasksByPriority)) {
        if (tasks.length > 0) {
            response += `${getPriorityLabel(priority)}:\n`;
            tasks.forEach(task => {
                const dueDate = task.due_date ? new Date(task.due_date).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC'
                }) : 'Sin fecha';
                response += `📌 ${task.title}\n`;
                if (task.description) {
                    response += `   📝 ${task.description}\n`;
                }
                response += `   📅 Fecha límite: ${dueDate}\n`;
                response += `   ${getStatusLabel(task.status)}\n`;
                if (task.linked_pages && task.linked_pages.length > 0) {
                    response += `   📄 Vinculada a ${task.linked_pages.length} página${task.linked_pages.length > 1 ? 's' : ''}\n`;
                }
                response += '\n';
            });
            response += '\n';
        }
    }
    if (sortedTasks.length === 0) {
        response = "No tienes tareas pendientes en este momento.";
    }
    else {
        // Añadir resumen al final
        response += `📊 Resumen:\n`;
        response += `• Tareas de alta prioridad: ${tasksByPriority.high.length}\n`;
        response += `• Tareas de media prioridad: ${tasksByPriority.medium.length}\n`;
        response += `• Tareas de baja prioridad: ${tasksByPriority.low.length}\n`;
        response += `• Total de tareas pendientes: ${sortedTasks.length}`;
    }
    return response;
};
const getPriorityWeight = (priority) => {
    switch (priority) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
    }
};
const findSimilarPages = (pages, searchTitle, threshold = 0.35) => {
    const normalizeString = (str) => str.toLowerCase().trim();
    const searchTitleNorm = normalizeString(searchTitle);
    const searchWords = searchTitleNorm.split(/\s+/);
    return pages
        .map(page => {
        const pageTitleNorm = normalizeString(page.title);
        const pageWords = pageTitleNorm.split(/\s+/);
        let similarity = 0;
        // Título exacto
        if (pageTitleNorm === searchTitleNorm) {
            similarity = 1;
        }
        // Título contiene la búsqueda o viceversa
        else if (pageTitleNorm.includes(searchTitleNorm) || searchTitleNorm.includes(pageTitleNorm)) {
            similarity = 0.8;
        }
        // Palabras en común y similares
        else {
            let matchedWords = 0;
            let partialMatches = 0;
            // Revisar cada palabra de la búsqueda
            for (const searchWord of searchWords) {
                // Buscar la mejor coincidencia para esta palabra
                let bestMatch = 0;
                for (const pageWord of pageWords) {
                    if (pageWord === searchWord) {
                        bestMatch = 1;
                        break;
                    }
                    else if (pageWord.includes(searchWord) || searchWord.includes(pageWord)) {
                        const matchLength = Math.min(searchWord.length, pageWord.length);
                        const maxLength = Math.max(searchWord.length, pageWord.length);
                        const matchRatio = matchLength / maxLength;
                        bestMatch = Math.max(bestMatch, matchRatio);
                    }
                }
                if (bestMatch === 1) {
                    matchedWords++;
                }
                else if (bestMatch > 0.5) {
                    partialMatches++;
                }
            }
            // Calcular similitud basada en coincidencias exactas y parciales
            similarity = (matchedWords + (partialMatches * 0.5)) / searchWords.length;
            // Penalizar si hay muchas palabras que no coinciden
            const unmatchedPageWords = pageWords.length - matchedWords - partialMatches;
            if (unmatchedPageWords > searchWords.length) {
                similarity *= 0.5;
            }
        }
        return { page, similarity };
    })
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .map(result => result.page);
};
const findSimilarFolders = (folders, searchName, threshold = 0.4) => {
    const normalizeString = (str) => str.toLowerCase().trim();
    const searchNameNorm = normalizeString(searchName);
    return folders
        .map(folder => {
        const folderNameNorm = normalizeString(folder.name);
        let similarity = 0;
        // Nombre exacto
        if (folderNameNorm === searchNameNorm) {
            similarity = 1;
        }
        // Nombre contiene la búsqueda o viceversa
        else if (folderNameNorm.includes(searchNameNorm) || searchNameNorm.includes(folderNameNorm)) {
            similarity = 0.8;
        }
        // Palabras en común
        else {
            const searchWords = searchNameNorm.split(/\s+/);
            const folderWords = folderNameNorm.split(/\s+/);
            const commonWords = searchWords.filter(word => folderWords.includes(word));
            similarity = commonWords.length / Math.max(searchWords.length, folderWords.length);
        }
        return { folder, similarity };
    })
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .map(result => result.folder);
};
const cleanAndParseJSON = (text) => {
    try {
        // Limpiar el texto
        let cleanText = text
            .replace(/```json\s*|\s*```/g, '') // Eliminar marcadores de código
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Eliminar caracteres de control
            .replace(/^\uFEFF/, '') // Eliminar BOM
            .trim();
        // Asegurarse de que el JSON esté completo
        if (!cleanText.endsWith('}')) {
            cleanText = cleanText.substring(0, cleanText.lastIndexOf('}') + 1);
        }
        // Intentar parsear el JSON
        return JSON.parse(cleanText);
    }
    catch (e) {
        console.error('Error parsing JSON:', e);
        throw new Error('Invalid JSON format');
    }
};
export const generateChatResponse = async (query, searchResults, previousResults = []) => {
    try {
        const actionPrompt = `
      Eres un asistente inteligente con acceso a un espacio de trabajo digital.
      
      CONSULTA: "${query}"
      
      CONTEXTO DE BÚSQUEDA:
      ${searchResults.map(result => `
        Título: ${result.title}
        Contenido: ${result.snippet}
        ---
      `).join('\n')}

      1. PRIMERO, identifica la intención y el tema:
         - ¿Es una búsqueda de información?
         - ¿Es una solicitud para crear una página?
         - ¿Es una gestión de tareas?

      2. Si es para CREAR UNA PÁGINA:
         - Identifica el tema principal
         - Busca información en el contexto proporcionado
         - Complementa con información externa
         - Estructura el contenido en secciones lógicas
         - NO repitas el título en el contenido
         - Usa niveles de encabezado apropiados (h2 para secciones principales, h3 para subsecciones)

      3. ESTRUCTURA la respuesta según el tipo:
         Para CREAR PÁGINA con contenido:
         {
           "action": "create_page",
           "details": {
             "title": "título descriptivo",
             "content": [
               {
                 "type": "heading",
                 "props": { "textAlignment": "left", "level": 2 },
                 "content": [{ "type": "text", "text": "Introducción" }],
                 "children": []
               },
               {
                 "type": "paragraph",
                 "props": { "textAlignment": "left" },
                 "content": [{ "type": "text", "text": "Contenido de introducción..." }],
                 "children": []
               },
               {
                 "type": "heading",
                 "props": { "textAlignment": "left", "level": 2 },
                 "content": [{ "type": "text", "text": "Sección Principal" }],
                 "children": []
               },
               {
                 "type": "paragraph",
                 "props": { "textAlignment": "left" },
                 "content": [{ "type": "text", "text": "Contenido de la sección..." }],
                 "children": []
               },
               {
                 "type": "heading",
                 "props": { "textAlignment": "left", "level": 3 },
                 "content": [{ "type": "text", "text": "Subsección" }],
                 "children": []
               },
               {
                 "type": "paragraph",
                 "props": { "textAlignment": "left" },
                 "content": [{ "type": "text", "text": "Detalles de la subsección..." }],
                 "children": []
               }
             ]
           }
         }

      IMPORTANTE:
      - NO repitas el título de la página en el contenido
      - USA h2 para secciones principales
      - USA h3 para subsecciones
      - ESTRUCTURA el contenido de forma clara y concisa
      - INCLUYE toda la información relevante
      - MANTÉN un formato consistente
      - NO incluyas IDs en los bloques, se generarán automáticamente

      Responde SOLO con el objeto JSON correspondiente.`;
        const actionResult = await model.generateContent(actionPrompt);
        const actionText = actionResult.response.text().trim();
        let actionResponse;
        try {
            actionResponse = cleanAndParseJSON(actionText);
        }
        catch (parseError) {
            console.error('Error parsing action response:', parseError);
            console.error('Raw action text:', actionText);
            throw new Error('Invalid action response format');
        }
        // Ejecutar la acción correspondiente
        switch (actionResponse.action) {
            case 'create_page':
                if (!actionResponse.details?.title || !Array.isArray(actionResponse.details?.content)) {
                    throw new Error('Missing page details or invalid content format');
                }
                // Limpiar y validar el contenido
                const cleanContent = actionResponse.details.content.map((block) => ({
                    type: block.type || 'paragraph',
                    props: {
                        textAlignment: block.props?.textAlignment || 'left',
                        backgroundColor: 'default',
                        textColor: 'default',
                        ...(block.type === 'heading' ? { level: block.props?.level || 2 } : {})
                    },
                    content: Array.isArray(block.content) ?
                        block.content.map((c) => ({
                            type: 'text',
                            text: String(c.text || ''),
                            styles: {}
                        })) :
                        [{
                                type: 'text',
                                text: String(block.content || ''),
                                styles: {}
                            }],
                    children: []
                }));
                await createPage(actionResponse.details.title, JSON.stringify(cleanContent));
                return `He creado una nueva página: "${actionResponse.details.title}"\n\nPuedes encontrarla en tu espacio de trabajo.`;
            case 'create_task':
                if (!actionResponse.details?.title) {
                    throw new Error('Missing task details');
                }
                // Validar y ajustar la fecha
                let dueDate = '';
                if (actionResponse.details.due_date) {
                    try {
                        dueDate = new Date(actionResponse.details.due_date).toISOString();
                    }
                    catch (e) {
                        console.error('Error parsing date:', e);
                        dueDate = '';
                    }
                }
                const taskDetails = {
                    title: actionResponse.details.title,
                    description: actionResponse.details.description || '',
                    due_date: dueDate || '',
                    priority: actionResponse.details.priority || 'high',
                    status: 'pending',
                    linked_pages: []
                };
                await createTask(taskDetails);
                return `He creado una nueva tarea:\n📌 ${taskDetails.title}\n📅 Fecha: ${dueDate ? new Date(dueDate).toLocaleString('es-ES', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                    timeZone: 'UTC'
                }) : 'Sin fecha'}\n${getPriorityLabel(taskDetails.priority)}`;
            case 'show_tasks':
                const tasks = await taskService.getAllTasks();
                const formattedTasks = await formatTaskList(tasks);
                return formattedTasks;
            case 'search':
            default:
                if (searchResults && searchResults.length > 0) {
                    let response = "He encontrado la siguiente información:\n\n";
                    searchResults.forEach(result => {
                        response += `📄 ${result.title}\n`;
                        response += `${result.snippet}\n\n`;
                    });
                    // Si se requiere información externa, añadirla
                    if (actionResponse.details?.require_external) {
                        response += "\n[EXTERNAL] Información complementaria:\n";
                        // Aquí se añadiría la información externa relevante
                    }
                    return response;
                }
                else {
                    return "No he encontrado información relacionada con tu consulta. ¿Quieres que cree una nueva página con esa información?";
                }
        }
    }
    catch (error) {
        console.error('Error detallado:', error);
        return 'Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta expresar tu solicitud de otra manera.';
    }
};
// Función auxiliar para formatear el contenido de una página
const formatPageContent = (content) => {
    if (typeof content === 'string') {
        try {
            return JSON.stringify(JSON.parse(content), null, 2);
        }
        catch {
            return content;
        }
    }
    return JSON.stringify(content, null, 2);
};
// Función auxiliar para crear una página
export const createPage = async (title, content) => {
    try {
        const page = await storageService.createPage(title);
        // Asegurarnos de que el contenido sea un array válido
        let contentArray;
        try {
            contentArray = JSON.parse(content);
            if (!Array.isArray(contentArray)) {
                contentArray = [
                    {
                        type: 'heading',
                        props: {
                            textAlignment: 'left',
                            level: 2,
                            backgroundColor: 'default',
                            textColor: 'default'
                        },
                        content: [{
                                type: 'text',
                                text: 'Introducción',
                                styles: {}
                            }],
                        children: []
                    },
                    {
                        type: 'paragraph',
                        props: {
                            textAlignment: 'left',
                            backgroundColor: 'default',
                            textColor: 'default'
                        },
                        content: [{
                                type: 'text',
                                text: content,
                                styles: {}
                            }],
                        children: []
                    }
                ];
            }
        }
        catch (e) {
            // Si el parsing falla, crear una estructura básica
            contentArray = [
                {
                    type: 'heading',
                    props: {
                        textAlignment: 'left',
                        level: 2,
                        backgroundColor: 'default',
                        textColor: 'default'
                    },
                    content: [{
                            type: 'text',
                            text: 'Introducción',
                            styles: {}
                        }],
                    children: []
                },
                {
                    type: 'paragraph',
                    props: {
                        textAlignment: 'left',
                        backgroundColor: 'default',
                        textColor: 'default'
                    },
                    content: [{
                            type: 'text',
                            text: content,
                            styles: {}
                        }],
                    children: []
                }
            ];
        }
        // Validar la estructura de cada bloque
        contentArray = contentArray.map((block) => ({
            type: block.type || 'paragraph',
            props: {
                textAlignment: block.props?.textAlignment || 'left',
                backgroundColor: 'default',
                textColor: 'default',
                ...(block.type === 'heading' ? { level: block.props?.level || 2 } : {})
            },
            content: Array.isArray(block.content) ?
                block.content.map((c) => ({
                    type: 'text',
                    text: String(c.text || ''),
                    styles: {}
                })) :
                [{
                        type: 'text',
                        text: String(block.content || ''),
                        styles: {}
                    }],
            children: []
        }));
        await storageService.updatePage(page.id, {
            ...page,
            content: JSON.stringify(contentArray)
        });
    }
    catch (error) {
        console.error('Error al crear la página:', error);
        throw error;
    }
};
// Función auxiliar para crear una tarea
export const createTask = async (taskDetails) => {
    try {
        await taskService.createTask({
            ...taskDetails,
            priority: taskDetails.priority || 'medium',
            status: taskDetails.status || 'pending'
        });
    }
    catch (error) {
        console.error('Error al crear la tarea:', error);
        throw error;
    }
};
const getPriorityLabel = (priority) => {
    switch (priority) {
        case 'high': return '🔴 Alta';
        case 'medium': return '🟡 Media';
        case 'low': return '🟢 Baja';
        default: return '🟡 Media';
    }
};
const getStatusLabel = (status) => {
    switch (status) {
        case 'pending': return '⭕ Pendiente';
        case 'in_progress': return '🔄 En Progreso';
        case 'completed': return '✅ Completada';
        default: return '⭕ Pendiente';
    }
};
export const generateTags = async (content, title) => {
    try {
        const prompt = `
      Analiza el siguiente contenido y su título para generar tags relevantes.
      
      Título: "${title}"
      Contenido: "${content}"

      INSTRUCCIONES:
      1. Genera entre 3 y 7 tags que:
         - Representen los temas principales
         - Incluyan categorías generales
         - Identifiquen conceptos específicos
         - Consideren el contexto y dominio
      2. Los tags deben:
         - Ser concisos (1-3 palabras máximo)
         - Estar en minúsculas
         - No contener espacios (usar guiones)
         - No incluir caracteres especiales
         - No repetir información
      3. Ordénalos por relevancia

      Responde SOLO con un array JSON de strings, sin explicaciones adicionales.
      Ejemplo: ["desarrollo-web", "javascript", "frontend", "react", "optimizacion"]
    `;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        // Limpiar y parsear la respuesta
        const cleanedText = text
            .replace(/^```json\s*/, '')
            .replace(/```$/, '')
            .trim();
        const tags = JSON.parse(cleanedText);
        // Validar y limpiar tags
        return tags
            .filter((tag) => typeof tag === 'string' && tag.length > 0)
            .map((tag) => tag.toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''))
            .filter((tag) => tag.length > 0)
            .slice(0, 7);
    }
    catch (error) {
        console.error('Error al generar tags:', error);
        return [];
    }
};
export const suggestRelatedTags = async (existingTags) => {
    try {
        const prompt = `
      Basado en estos tags existentes: ${JSON.stringify(existingTags)}
      
      Sugiere 3-5 tags adicionales que:
      1. Estén relacionados temáticamente
      2. Complementen los existentes
      3. Añadan valor para búsquedas
      4. No repitan conceptos ya presentes
      
      Responde SOLO con un array JSON de strings, siguiendo el mismo formato que los tags existentes.
    `;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        // Limpiar y parsear la respuesta
        const cleanedText = text
            .replace(/^```json\s*/, '')
            .replace(/```$/, '')
            .trim();
        const suggestedTags = JSON.parse(cleanedText);
        // Filtrar tags que ya existen
        return suggestedTags
            .filter((tag) => typeof tag === 'string' &&
            tag.length > 0 &&
            !existingTags.includes(tag.toLowerCase()))
            .map((tag) => tag.toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''))
            .filter((tag) => tag.length > 0)
            .slice(0, 5);
    }
    catch (error) {
        console.error('Error al sugerir tags relacionados:', error);
        return [];
    }
};
