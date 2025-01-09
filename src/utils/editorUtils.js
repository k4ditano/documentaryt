import { Editor, Element as SlateElement, Transforms, Text } from 'slate';
export const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};
export const toggleFormat = (editor, format) => {
    const isActive = isFormatActive(editor, format);
    Transforms.setNodes(editor, { [format]: isActive ? null : true }, { match: Text.isText, split: true });
};
export const isFormatActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => Text.isText(n) && n[format] === true,
        mode: 'all',
    });
    return !!match;
};
export const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    const isList = ['numbered-list', 'bulleted-list'].includes(format);
    Transforms.unwrapNodes(editor, {
        match: (n) => !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            ['numbered-list', 'bulleted-list'].includes(n.type),
        split: true,
    });
    const newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
    Transforms.setNodes(editor, newProperties);
    if (!isActive && isList) {
        const block = {
            type: format,
            children: [],
        };
        Transforms.wrapNodes(editor, block);
    }
};
export const isBlockActive = (editor, format) => {
    const { selection } = editor;
    if (!selection)
        return false;
    const [match] = Array.from(Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    }));
    return !!match;
};
export const withImages = (editor) => {
    const { isVoid } = editor;
    const originalInsertData = editor.insertData;
    editor.isVoid = (element) => {
        return element.type === 'image' ? true : isVoid(element);
    };
    editor.insertData = (data) => {
        const text = data.getData('text/plain');
        const { files } = data;
        if (files && files.length > 0) {
            for (const file of Array.from(files)) {
                const reader = new FileReader();
                const [mime] = file.type.split('/');
                if (mime === 'image') {
                    reader.addEventListener('load', () => {
                        const url = reader.result;
                        insertImage(editor, url);
                    });
                    reader.readAsDataURL(file);
                }
            }
        }
        else if (isImageUrl(text)) {
            insertImage(editor, text);
        }
        else if (originalInsertData) {
            originalInsertData(data);
        }
    };
    return editor;
};
export const insertImage = (editor, url, caption) => {
    const text = { text: '' };
    const image = {
        type: 'image',
        url,
        caption,
        children: [text],
    };
    Transforms.insertNodes(editor, image);
};
export const isImageUrl = (url) => {
    if (!url)
        return false;
    if (!isUrl(url))
        return false;
    const ext = new URL(url).pathname.split('.').pop();
    return ext ? ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext) : false;
};
export const isUrl = (str) => {
    try {
        new URL(str);
        return true;
    }
    catch {
        return false;
    }
};
