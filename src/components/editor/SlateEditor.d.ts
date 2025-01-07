import type { FC } from 'react';
import { CustomDescendant } from '../../types/slate';
interface SlateEditorProps {
    initialValue: CustomDescendant[];
    onChange: (value: CustomDescendant[]) => void;
    readOnly?: boolean;
}
declare const SlateEditor: FC<SlateEditorProps>;
export default SlateEditor;
