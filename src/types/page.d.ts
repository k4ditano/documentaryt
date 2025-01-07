export interface Page {
    id: string;
    title: string;
    content: string;
    lastModified: Date;
    createdAt: Date;
    parentId?: string;
    permissions: {
        read: string[];
        write: string[];
        admin: string[];
    };
}
export interface PageMetadata {
    id: string;
    title: string;
    lastModified: Date;
    parentId?: string;
}
