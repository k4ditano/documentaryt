import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { RenderElementProps } from 'slate-react';
import { CustomElement } from '../../types/slate';

const Element: FC<RenderElementProps> = ({ attributes, children, element }) => {
  const style = { margin: '4px 0' };

  switch (element.type) {
    case 'heading':
      return (
        <Typography variant="h4" sx={style} {...attributes}>
          {children}
        </Typography>
      );
    case 'code':
      return (
        <Box
          component="pre"
          sx={{
            p: 2,
            backgroundColor: 'grey.100',
            borderRadius: 1,
            fontFamily: 'monospace',
            overflowX: 'auto',
            ...style,
          }}
          {...attributes}
        >
          {children}
        </Box>
      );
    case 'bulleted-list':
      return (
        <Box component="ul" sx={style} {...attributes}>
          {children}
        </Box>
      );
    case 'numbered-list':
      return (
        <Box component="ol" sx={style} {...attributes}>
          {children}
        </Box>
      );
    case 'list-item':
      return (
        <Box component="li" sx={style} {...attributes}>
          {children}
        </Box>
      );
    case 'image':
      const imageElement = element as CustomElement & { type: 'image' };
      return (
        <Box sx={{ textAlign: 'center', ...style }} {...attributes}>
          <Box
            component="img"
            src={imageElement.url}
            alt=""
            sx={{
              maxWidth: '100%',
              maxHeight: '20em',
              objectFit: 'contain',
            }}
            contentEditable={false}
          />
          {children}
        </Box>
      );
    case 'table':
      return (
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', ...style }} {...attributes}>
          <tbody>{children}</tbody>
        </Box>
      );
    case 'table-row':
      return (
        <Box component="tr" {...attributes}>
          {children}
        </Box>
      );
    case 'table-cell':
      return (
        <Box
          component="td"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            p: 1,
            minWidth: '100px',
          }}
          {...attributes}
        >
          {children}
        </Box>
      );
    case 'math':
      const mathElement = element as CustomElement & { type: 'math' };
      return (
        <Box
          sx={{
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: 1,
            fontFamily: 'monospace',
            ...style,
          }}
          {...attributes}
        >
          <Box contentEditable={false}>{mathElement.formula}</Box>
          {children}
        </Box>
      );
    default:
      return (
        <Box component="p" sx={style} {...attributes}>
          {children}
        </Box>
      );
  }
};

export default Element; 