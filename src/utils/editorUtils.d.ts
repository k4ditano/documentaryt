import { CustomEditor, CustomElement } from '../types/slate';
type HotkeyFormat = 'bold' | 'italic' | 'underline' | 'code';
export declare const HOTKEYS: Record<string, HotkeyFormat>;
export declare const toggleFormat: (editor: CustomEditor, format: HotkeyFormat) => void;
export declare const isFormatActive: (editor: CustomEditor, format: string) => boolean;
export declare const toggleBlock: (editor: CustomEditor, format: CustomElement["type"]) => void;
export declare const isBlockActive: (editor: CustomEditor, format: string) => boolean;
export declare const withImages: (editor: CustomEditor) => CustomEditor;
export declare const insertImage: (editor: CustomEditor, url: string, caption?: string) => void;
export declare const isImageUrl: (url: string) => boolean;
export declare const isUrl: (str: string) => boolean;
export {};
