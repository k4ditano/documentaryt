import { Editor, Element as SlateElement, Transforms, Text, Node } from 'slate';
import { CustomEditor, CustomElement } from '../types/slate';
import isHotkey from 'is-hotkey';

type HotkeyFormat = 'bold' | 'italic' | 'underline' | 'code';

export const HOTKEYS: Record<string, HotkeyFormat> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

export const toggleFormat = (editor: CustomEditor, format: HotkeyFormat) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
};

export const isFormatActive = (editor: CustomEditor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => Text.isText(n) && n[format as keyof typeof n] === true,
    mode: 'all',
  });
  return !!match;
};

export const toggleBlock = (editor: CustomEditor, format: CustomElement['type']) => {
  const isActive = isBlockActive(editor, format);
  const isList = ['numbered-list', 'bulleted-list'].includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['numbered-list', 'bulleted-list'].includes(n.type),
    split: true,
  });

  const newProperties: Partial<CustomElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };

  Transforms.setNodes<CustomElement>(editor, newProperties);

  if (!isActive && isList) {
    const block: CustomElement = {
      type: format,
      children: [],
    } as CustomElement;
    Transforms.wrapNodes(editor, block);
  }
};

export const isBlockActive = (editor: CustomEditor, format: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  );

  return !!match;
};

export const withImages = (editor: CustomEditor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element: any) => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result;
            insertImage(editor, url as string);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const insertImage = (editor: CustomEditor, url: string, caption?: string) => {
  const text = { text: '' };
  const image: CustomElement = {
    type: 'image',
    url,
    caption,
    children: [text],
  } as CustomElement;
  Transforms.insertNodes(editor, image);
};

export const isImageUrl = (url: string) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  return ext ? ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext) : false;
};

export const isUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}; 