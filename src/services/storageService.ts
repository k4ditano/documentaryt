import type { Page, Folder } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface File {
  id: string;
  name: string;
  url: string;
  created_at: string;
  user_id: string;
  page_id: string;
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

export const storageService = {
  async getPages(): Promise<Page[]> {
    const response = await fetch(`${API_URL}/pages`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al obtener las páginas');
    return response.json();
  },

  async getPage(id: string): Promise<Page> {
    const response = await fetch(`${API_URL}/pages/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al obtener la página');
    return response.json();
  },

  async createPage(title: string, parent_id: string | null = null): Promise<Page> {
    const initialBlocks = [
      createBlock("heading", title, "1", { level: 1 }),
      createBlock("paragraph", "", "2")
    ];

    const response = await fetch(`${API_URL}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        title,
        parent_id,
        content: JSON.stringify(initialBlocks),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || 'Error al crear la página');
    }

    const page = await response.json();
    
    // Asegurarse de que el contenido sea un string válido
    if (typeof page.content !== 'string') {
      page.content = JSON.stringify(initialBlocks);
    }

    return page;
  },

  updatePage: async (pageId: string, updates: Partial<Page>): Promise<Page> => {
    try {
      console.log('Iniciando actualización de página:', {
        id: pageId,
        hasContent: !!updates.content,
        contentType: updates.content ? typeof updates.content : 'N/A'
      });

      // Validar y formatear el contenido
      if (updates.content) {
        let contentToSend;
        if (typeof updates.content === 'object') {
          console.log('Contenido es objeto, convirtiendo a string...');
          contentToSend = JSON.stringify(updates.content);
        } else if (typeof updates.content === 'string') {
          console.log('Contenido es string, validando...');
          try {
            const parsed = JSON.parse(updates.content);
            if (!Array.isArray(parsed)) {
              throw new Error('El contenido debe ser un array');
            }
            contentToSend = updates.content;
          } catch (e) {
            console.error('Error validando contenido:', e);
            throw new Error('El contenido debe ser un JSON válido');
          }
        } else {
          throw new Error('El contenido debe ser un objeto o string JSON válido');
        }
        
        console.log('Contenido preparado para enviar, longitud:', contentToSend.length);
        updates.content = contentToSend;
      }

      const response = await fetch(`${API_URL}/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.error || 'Error al actualizar la página');
      }

      const updatedPage = await response.json();
      
      if (!updatedPage || !updatedPage.id) {
        console.error('Respuesta inválida del servidor:', updatedPage);
        throw new Error('El servidor devolvió una respuesta inválida');
      }

      console.log('Respuesta recibida del servidor:', {
        id: updatedPage.id,
        hasContent: !!updatedPage.content,
        contentType: updatedPage.content ? typeof updatedPage.content : 'N/A'
      });

      // Asegurarse de que el contenido sea un string válido
      if (updatedPage.content) {
        try {
          if (typeof updatedPage.content !== 'string') {
            console.log('Convirtiendo contenido de respuesta a string...');
            updatedPage.content = JSON.stringify(updatedPage.content);
          }
          
          console.log('Validando contenido de respuesta...');
          const parsed = JSON.parse(updatedPage.content);
          if (!Array.isArray(parsed)) {
            throw new Error('El servidor devolvió un contenido inválido');
          }
          
          console.log('Contenido de respuesta validado, longitud:', updatedPage.content.length);
        } catch (error) {
          console.error('Error validando contenido de respuesta:', error);
          throw new Error('El servidor devolvió un contenido inválido');
        }
      }

      console.log('Página actualizada exitosamente:', {
        id: updatedPage.id,
        title: updatedPage.title,
        contentLength: updatedPage.content ? updatedPage.content.length : 'N/A'
      });

      return updatedPage;
    } catch (error) {
      console.error('Error al actualizar página:', error);
      throw error;
    }
  },

  async deletePage(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/pages/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al eliminar la página');
  },

  async getFolders(): Promise<Folder[]> {
    const response = await fetch(`${API_URL}/folders`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al obtener las carpetas');
    return response.json();
  },

  async createFolder(name: string, parent_id: string | null = null): Promise<Folder> {
    const response = await fetch(`${API_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name,
        parent_id,
      }),
    });
    if (!response.ok) throw new Error('Error al crear la carpeta');
    return response.json();
  },

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    try {
      const response = await fetch(`${API_URL}/folders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la carpeta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar carpeta:', error);
      throw new Error('Error al actualizar la carpeta');
    }
  },

  async deleteFolder(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al eliminar la carpeta');
  },

  async uploadFile(formData: FormData, page_id: string): Promise<File> {
    console.log('Enviando archivo:', formData.get('file'), 'page_id:', page_id);
    
    const response = await fetch(`${API_URL}/files/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      console.error('Error en la respuesta:', await response.text());
      throw new Error('Error al subir el archivo');
    }

    return response.json();
  },

  async getPageFiles(page_id: string): Promise<File[]> {
    const response = await fetch(`${API_URL}/files/page/${page_id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al obtener los archivos');
    return response.json();
  },

  async deleteFile(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/files/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al eliminar el archivo');
  },

  async updatePositions(updates: Array<{ id: string; type: string; position: number; parent_id: string | null }>): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/positions/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar posiciones');
      }

      const result = await response.json();
      return result.data; // Retornamos los datos actualizados
    } catch (error) {
      console.error('Error al actualizar posiciones:', error);
      throw error;
    }
  },
}; 