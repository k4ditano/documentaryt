import { FC } from 'react';
import '@blocknote/core/style.css';
import '@blocknote/mantine/style.css';
interface BlockNoteEditorProps {
    content: string;
    onChange: (content: string) => void;
}
declare const BlockNoteEditor: FC<BlockNoteEditorProps>;
export default BlockNoteEditor;
