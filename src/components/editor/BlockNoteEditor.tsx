import { FC, useEffect, useState, useRef } from 'react';
import { useBlockNote } from '@blocknote/react';
import { BlockNoteView, Theme, darkDefaultTheme, lightDefaultTheme } from '@blocknote/mantine';
import { Block, BlockSchema, DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema } from '@blocknote/core';
import '@blocknote/core/style.css';
import '@blocknote/mantine/style.css';
import '../../styles/blocknote-editor.css';

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

const BlockNoteEditor: FC<BlockNoteEditorProps> = ({
  initialContent = '',
  onChange,
  readOnly = false
}) => {
  const editor = useBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onEditorContentChange: (editor) => {
      const saveContent = async () => {
        const blocks = await editor.blocksToMarkdown(editor.topLevelBlocks);
        onChange?.(blocks);
      };
      saveContent();
    },
    editable: !readOnly
  });

  return (
    <div className="bn-container">
      <BlockNoteView
        editor={editor}
        theme={lightDefaultTheme}
      />
    </div>
  );
};

export default BlockNoteEditor; 