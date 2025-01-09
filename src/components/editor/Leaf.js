import { jsx as _jsx } from "react/jsx-runtime";
const Leaf = ({ attributes, children, leaf }) => {
    let styledChildren = children;
    if (leaf.bold) {
        styledChildren = _jsx("strong", { children: styledChildren });
    }
    if (leaf.italic) {
        styledChildren = _jsx("em", { children: styledChildren });
    }
    if (leaf.underline) {
        styledChildren = _jsx("u", { children: styledChildren });
    }
    if (leaf.code) {
        styledChildren = (_jsx("code", { style: {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                padding: '0.2em 0.4em',
                borderRadius: '3px',
                fontSize: '85%',
                fontFamily: 'monospace',
            }, children: styledChildren }));
    }
    return _jsx("span", { ...attributes, children: styledChildren });
};
export default Leaf;
