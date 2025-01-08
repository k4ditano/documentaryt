import type { Page, Folder } from '../types/index';
import axios from 'axios';

const API_URL = '/api';

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
    const response = await axios.get<Page[]>(`${API_URL}/pages`);
    return response.data;
  },

  async getPage(id: string): Promise<Page> {
    const response = await axios.get<Page>(`${API_URL}/pages/${id}`);
    return response.data;
  },

  async createPage(title: string, parent_id: string | null = null): Promise<Page> {
    const initialBlocks = [
      createBlock("heading", title, "1", { level: 1 }),
      createBlock("paragraph", "", "2")
    ];

    const response = await axios.post<Page>(`${API_URL}/pages`, {
      title,
      parent_id,
      content: JSON.stringify(initialBlocks),
    });

    const page = response.data;
    
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

      const response = await axios.put<Page>(`${API_URL}/pages/${pageId}`, updates);
      const updatedPage = response.data;

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
    await axios.delete(`${API_URL}/pages/${id}`);
  },

  async getFolders(): Promise<Folder[]> {
    const response = await axios.get<Folder[]>(`${API_URL}/folders`);
    return response.data;
  },

  async createFolder(name: string, parent_id: string | null = null): Promise<Folder> {
    const response = await axios.post<Folder>(`${API_URL}/folders`, {
      name,
      parent_id,
    });
    return response.data;
  },

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    try {
      const response = await axios.put<Folder>(`${API_URL}/folders/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar carpeta:', error);
      throw new Error('Error al actualizar la carpeta');
    }
  },

  async deleteFolder(id: string): Promise<void> {
    await axios.delete(`${API_URL}/folders/${id}`);
  },

  async uploadFile(formData: FormData, page_id: string): Promise<File> {
    console.log('Enviando archivo:', formData.get('file'), 'page_id:', page_id);
    
    const response = await axios.post<File>(`${API_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  async getPageFiles(page_id: string): Promise<File[]> {
    const response = await axios.get<File[]>(`${API_URL}/files/page/${page_id}`);
    return response.data;
  },

  async deleteFile(id: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${id}`);
  },

  async updatePositions(updates: Array<{ id: string; type: string; position: number; parent_id: string | null }>): Promise<any> {
    try {
      const response = await axios.put<{data: any}>(`${API_URL}/positions/update`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar posiciones:', error);
      throw error;
    }
  },
}; 