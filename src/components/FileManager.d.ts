import { FC } from 'react';
interface FileType {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document';
    size: number;
    uploadDate: string;
    pageId: string;
}
interface FileManagerProps {
    files: FileType[];
    onUpload: (file: globalThis.File) => void;
    onDelete: (fileId: string) => void;
}
declare const FileManager: FC<FileManagerProps>;
export default FileManager;
