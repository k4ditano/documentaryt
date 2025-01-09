import { jsx as _jsx } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
export const SortableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (_jsx("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: children }));
};
