import type { FC } from 'react';
interface ImageUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onImageUpload: (imageUrl: string) => void;
}
declare const ImageUploadDialog: FC<ImageUploadDialogProps>;
export default ImageUploadDialog;
