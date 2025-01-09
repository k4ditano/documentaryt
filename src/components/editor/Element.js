import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography } from '@mui/material';
const Element = ({ attributes, children, element }) => {
    const style = { margin: '4px 0' };
    switch (element.type) {
        case 'heading':
            return (_jsx(Typography, { variant: "h4", sx: style, ...attributes, children: children }));
        case 'code':
            return (_jsx(Box, { component: "pre", sx: {
                    p: 2,
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    ...style,
                }, ...attributes, children: children }));
        case 'bulleted-list':
            return (_jsx(Box, { component: "ul", sx: style, ...attributes, children: children }));
        case 'numbered-list':
            return (_jsx(Box, { component: "ol", sx: style, ...attributes, children: children }));
        case 'list-item':
            return (_jsx(Box, { component: "li", sx: style, ...attributes, children: children }));
        case 'image':
            const imageElement = element;
            return (_jsxs(Box, { sx: { textAlign: 'center', ...style }, ...attributes, children: [_jsx(Box, { component: "img", src: imageElement.url, alt: "", sx: {
                            maxWidth: '100%',
                            maxHeight: '20em',
                            objectFit: 'contain',
                        }, contentEditable: false }), children] }));
        case 'table':
            return (_jsx(Box, { component: "table", sx: { width: '100%', borderCollapse: 'collapse', ...style }, ...attributes, children: _jsx("tbody", { children: children }) }));
        case 'table-row':
            return (_jsx(Box, { component: "tr", ...attributes, children: children }));
        case 'table-cell':
            return (_jsx(Box, { component: "td", sx: {
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1,
                    minWidth: '100px',
                }, ...attributes, children: children }));
        case 'math':
            const mathElement = element;
            return (_jsxs(Box, { sx: {
                    p: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    ...style,
                }, ...attributes, children: [_jsx(Box, { contentEditable: false, children: mathElement.formula }), children] }));
        default:
            return (_jsx(Box, { component: "p", sx: style, ...attributes, children: children }));
    }
};
export default Element;
