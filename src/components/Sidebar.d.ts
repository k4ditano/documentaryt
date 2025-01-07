import { FC } from 'react';
interface SidebarProps {
    isMobile?: boolean;
    open?: boolean;
    onClose?: () => void;
}
declare const Sidebar: FC<SidebarProps>;
export default Sidebar;
