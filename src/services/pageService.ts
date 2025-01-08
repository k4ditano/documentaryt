import axios from 'axios';
import type { Page, PageUpdate } from '../types/page';

const API_URL = '/api/pages';

export const pageService = {
  getPages: async (): Promise<Page[]> => {
    const response = await axios.get<Page[]>(API_URL);
    return response.data;
  },

  getPage: async (id: string): Promise<Page> => {
    const response = await axios.get<Page>(`${API_URL}/${id}`);
    return response.data;
  },

  createPage: async (page: Partial<Page>): Promise<Page> => {
    const response = await axios.post<Page>(API_URL, page);
    return response.data;
  },

  updatePage: async (id: string, page: PageUpdate): Promise<Page> => {
    const response = await axios.put<Page>(`${API_URL}/${id}`, page);
    return response.data;
  },

  deletePage: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
}; 