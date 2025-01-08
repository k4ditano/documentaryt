import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export interface CustomEditor extends BaseEditor, ReactEditor, HistoryEditor {
  insertData: (data: DataTransfer) => void;
  isVoid: (element: any) => boolean;
}

export type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

export type HeadingElement = {
  type: 'heading';
  level: number;
  children: CustomText[];
};

export type CodeElement = {
  type: 'code';
  children: CustomText[];
};

export type ListItemElement = {
  type: 'list-item';
  children: CustomText[];
};

export type BulletedListElement = {
  type: 'bulleted-list';
  children: ListItemElement[];
};

export type NumberedListElement = {
  type: 'numbered-list';
  children: ListItemElement[];
};

export type ImageElement = {
  type: 'image';
  url: string;
  children: CustomText[];
};

export type TableElement = {
  type: 'table';
  children: TableRowElement[];
};

export type TableRowElement = {
  type: 'table-row';
  children: TableCellElement[];
};

export type TableCellElement = {
  type: 'table-cell';
  children: CustomText[];
};

export type MathElement = {
  type: 'math';
  formula: string;
  children: CustomText[];
};

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | CodeElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement
  | ImageElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | MathElement;

export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

export type CustomText = FormattedText;

export type CustomDescendant = CustomElement | CustomText;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
} 