export interface Page {
  id: string;
  title: string;
  content?: string;
  parent_id: string | null;
  position?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
  tags?: string[];
}

export interface PageWithoutTags extends Omit<Page, 'tags'> {
  tags?: string[];
}

export type PageUpdate = Partial<Page> & {
  tags?: string[];
}; 