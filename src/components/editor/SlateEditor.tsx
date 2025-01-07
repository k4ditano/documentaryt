import type { FC } from 'react';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { CustomDescendant, CustomText, CustomEditor } from '../../types/slate';
import Leaf from './Leaf';
import Element from './Element';
import Toolbar from './Toolbar';
import ImageUploadDialog from './ImageUploadDialog';
import { isHotkey } from 'is-hotkey';
import { Box } from '@mui/material';

interface SlateEditorProps {
  initialValue: CustomDescendant[];
  onChange: (value: CustomDescendant[]) => void;
  readOnly?: boolean;
}

const HOTKEYS: Record<string, keyof Omit<CustomText, 'text'>> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const defaultValue: CustomDescendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const SlateEditor: FC<SlateEditorProps> = ({ initialValue, onChange, readOnly = false }) => {
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()));
    return e;
  }, []);

  const [showImageDialog, setShowImageDialog] = useState(false);

  // Actualizar el contenido del editor cuando cambia initialValue
  useEffect(() => {
    if (initialValue?.length > 0) {
      const content = Array.isArray(initialValue) ? initialValue : defaultValue;
      editor.children = content;
      editor.onChange();
    }
  }, [editor, initialValue]);

  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) return;

      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event as any)) {
          event.preventDefault();
          const mark = HOTKEYS[hotkey];
          const isActive = isMarkActive(editor, mark);

          if (isActive) {
            Editor.removeMark(editor, mark);
          } else {
            Editor.addMark(editor, mark, true);
          }
        }
      }
    },
    [editor, readOnly]
  );

  const handleChange = useCallback(
    (value: CustomDescendant[]) => {
      if (!readOnly) {
        onChange(value);
      }
    },
    [onChange, readOnly]
  );

  const editorValue = useMemo(() => {
    return initialValue?.length > 0 ? initialValue : defaultValue;
  }, [initialValue]);

  const handleImageClick = useCallback(() => {
    setShowImageDialog(true);
  }, []);

  const handleImageUpload = useCallback((imageUrl: string) => {
    const image: CustomDescendant = {
      type: 'image',
      url: imageUrl,
      children: [{ text: '' }],
    };

    Transforms.insertNodes(editor, image);
  }, [editor]);

  return (
    <Box sx={{ border: readOnly ? 'none' : '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Slate 
        editor={editor} 
        initialValue={editorValue}
        onChange={handleChange}
      >
        {!readOnly && <Toolbar onImageClick={handleImageClick} />}
        <Box sx={{ p: 2 }}>
          <Editable
            readOnly={readOnly}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
            placeholder="Comienza a escribir..."
            style={{
              minHeight: '300px',
            }}
          />
        </Box>
      </Slate>

      <ImageUploadDialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={handleImageUpload}
      />
    </Box>
  );
};

const isMarkActive = (editor: CustomEditor, format: keyof Omit<CustomText, 'text'>) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export default SlateEditor; 