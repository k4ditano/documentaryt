import React from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  Title,
  Image as ImageIcon,
  TableChart,
  Functions,
} from '@mui/icons-material';
import { useSlate } from 'slate-react';
import { Editor, Element as SlateElement, Transforms } from 'slate';
import { CustomEditor, CustomElement, CustomText } from '../../types/slate';

interface ToolbarProps {
  onImageClick?: () => void;
}

type MarkFormat = keyof Omit<CustomText, 'text'>;
type BlockFormat = CustomElement['type'];

const Toolbar: React.FC<ToolbarProps> = ({ onImageClick }) => {
  const editor = useSlate() as CustomEditor;

  const isBlockActive = (format: BlockFormat) => {
    const [match] = Array.from(
      Editor.nodes(editor, {
        match: (n): n is CustomElement =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
      })
    );
    return !!match;
  };

  const isMarkActive = (format: MarkFormat) => {
    const marks = Editor.marks(editor) as Partial<CustomText> | null;
    return marks ? marks[format] === true : false;
  };

  const toggleBlock = (format: BlockFormat) => {
    const isActive = isBlockActive(format);

    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : format } as Partial<CustomElement>,
      {
        match: (n): n is CustomElement =>
          !Editor.isEditor(n) && SlateElement.isElement(n),
      }
    );
  };

  const toggleMark = (format: MarkFormat) => {
    const isActive = isMarkActive(format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 1,
        gap: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        flexWrap: 'wrap',
      }}
    >
      {/* Formato de texto */}
      <Tooltip title="Negrita (Ctrl+B)">
        <IconButton
          size="small"
          onClick={() => toggleMark('bold')}
          color={isMarkActive('bold') ? 'primary' : 'default'}
        >
          <FormatBold />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cursiva (Ctrl+I)">
        <IconButton
          size="small"
          onClick={() => toggleMark('italic')}
          color={isMarkActive('italic') ? 'primary' : 'default'}
        >
          <FormatItalic />
        </IconButton>
      </Tooltip>
      <Tooltip title="Subrayado (Ctrl+U)">
        <IconButton
          size="small"
          onClick={() => toggleMark('underline')}
          color={isMarkActive('underline') ? 'primary' : 'default'}
        >
          <FormatUnderlined />
        </IconButton>
      </Tooltip>
      <Tooltip title="Código (Ctrl+`)">
        <IconButton
          size="small"
          onClick={() => toggleMark('code')}
          color={isMarkActive('code') ? 'primary' : 'default'}
        >
          <Code />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Bloques */}
      <Tooltip title="Encabezado">
        <IconButton
          size="small"
          onClick={() => toggleBlock('heading')}
          color={isBlockActive('heading') ? 'primary' : 'default'}
        >
          <Title />
        </IconButton>
      </Tooltip>
      <Tooltip title="Lista con viñetas">
        <IconButton
          size="small"
          onClick={() => toggleBlock('bulleted-list')}
          color={isBlockActive('bulleted-list') ? 'primary' : 'default'}
        >
          <FormatListBulleted />
        </IconButton>
      </Tooltip>
      <Tooltip title="Lista numerada">
        <IconButton
          size="small"
          onClick={() => toggleBlock('numbered-list')}
          color={isBlockActive('numbered-list') ? 'primary' : 'default'}
        >
          <FormatListNumbered />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Elementos especiales */}
      <Tooltip title="Insertar imagen">
        <IconButton size="small" onClick={onImageClick}>
          <ImageIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Insertar tabla">
        <IconButton
          size="small"
          onClick={() => toggleBlock('table')}
          color={isBlockActive('table') ? 'primary' : 'default'}
        >
          <TableChart />
        </IconButton>
      </Tooltip>
      <Tooltip title="Insertar fórmula">
        <IconButton
          size="small"
          onClick={() => toggleBlock('math')}
          color={isBlockActive('math') ? 'primary' : 'default'}
        >
          <Functions />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar; 