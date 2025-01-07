import { Task } from './taskService';
interface PDFAnalysis {
    summary: string;
    suggestedTitle: string;
    keyPoints: string[];
    tags: string[];
}
export interface SearchResult {
    pageId: string;
    title: string;
    relevance: number;
    snippet: string;
    matchType: 'exact' | 'partial' | 'related';
    category: 'content' | 'title' | 'tag';
    context: string;
    lastModified?: string;
    suggestion?: string;
}
export interface SuggestedAction {
    type?: string;
    title?: string;
    description?: string;
    priority?: string;
    relatedPageIds?: string[];
    suggestedTags?: string[];
    category?: string;
}
export declare const generateSuggestions: (content: string) => Promise<string[]>;
export declare const generateSummary: (content: string) => Promise<string>;
export declare const analyzeContent: (content: string) => Promise<{
    keywords: string[];
    topics: string[];
    entities: string[];
}>;
export declare const searchContent: (query: string, pages: any[], previousResults?: SearchResult[]) => Promise<{
    results: SearchResult[];
    suggestedActions: Array<any>;
    filters: any;
}>;
export declare const analyzePDF: (pdfText: string) => Promise<PDFAnalysis>;
export declare const generateContent: (title: string) => Promise<string>;
export declare const generateChatResponse: (query: string, searchResults: SearchResult[], previousResults?: SearchResult[]) => Promise<string>;
export declare const createPage: (title: string, content: string) => Promise<void>;
export declare const createTask: (taskDetails: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>;
export declare const generateTags: (content: string, title: string) => Promise<string[]>;
export declare const suggestRelatedTags: (existingTags: string[]) => Promise<string[]>;
export {};
