export interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    type?: 'folder';
} 