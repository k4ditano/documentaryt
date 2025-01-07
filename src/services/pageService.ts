import { Page, PageMetadata } from '../types/page';

// Simulación de almacenamiento local
let pages: Page[] = [
  {
    id: '1',
    title: 'Bienvenido a Notion2',
    content: '<p>Esta es tu primera página en Notion2.</p>',
    lastModified: new Date(),
    createdAt: new Date(),
    permissions: {
      read: ['*'],
      write: ['owner'],
      admin: ['owner'],
    },
  },
];

export const getPages = async (): Promise<PageMetadata[]> => {
  return pages.map(({ id, title, lastModified, parentId }) => ({
    id,
    title,
    lastModified,
    parentId,
  }));
};

export const getPage = async (id: string): Promise<Page | null> => {
  return pages.find(page => page.id === id) || null;
};

export const createPage = async (page: Omit<Page, 'id' | 'createdAt' | 'lastModified'>): Promise<Page> => {
  const newPage: Page = {
    ...page,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    lastModified: new Date(),
  };
  pages.push(newPage);
  return newPage;
};

export const updatePage = async (id: string, updates: Partial<Page>): Promise<Page | null> => {
  const index = pages.findIndex(page => page.id === id);
  if (index === -1) return null;

  pages[index] = {
    ...pages[index],
    ...updates,
    lastModified: new Date(),
  };

  return pages[index];
};

export const deletePage = async (id: string): Promise<boolean> => {
  const initialLength = pages.length;
  pages = pages.filter(page => page.id !== id);
  return pages.length !== initialLength;
}; 