import React from 'react';
import { RenderLeafProps } from 'slate-react';

const Leaf: React.FC<RenderLeafProps> = ({ attributes, children, leaf }) => {
  let styledChildren = children;

  if (leaf.bold) {
    styledChildren = <strong>{styledChildren}</strong>;
  }

  if (leaf.italic) {
    styledChildren = <em>{styledChildren}</em>;
  }

  if (leaf.underline) {
    styledChildren = <u>{styledChildren}</u>;
  }

  if (leaf.code) {
    styledChildren = (
      <code
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '0.2em 0.4em',
          borderRadius: '3px',
          fontSize: '85%',
          fontFamily: 'monospace',
        }}
      >
        {styledChildren}
      </code>
    );
  }

  return <span {...attributes}>{styledChildren}</span>;
};

export default Leaf; 