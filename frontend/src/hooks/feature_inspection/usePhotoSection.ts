import React, { useRef } from 'react';
import { useAppStore } from '@/utils/states/useAppStore';
import { getImageServerUrl_api, uploadFileToPHP, saveImageRecord_api, deleteImage_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';

export const PHOTO_CATEGORIES = [
    { label: 'China Hangtab', id: 'HANGTAB', types: 'Product' },
    { label: 'Picture for special packaging (optional)', id: 'PACKAGING', types: 'Product' },
    { label: 'Compare Sample vs. Actual', id: 'COMPARE', types: 'Product' },
    { label: 'Exceptional development approval vs. Actual', id: 'EXCEPTIONAL', types: 'Product' },
    { label: 'Defect photo (optional)', id: 'DEFECT', types: 'Product' },
    { label: 'Measurements', id: 'MEASUREMENTS', types: 'Measurements' },
];

export const usePhotoSection = () => {
    const { images, addImage, removeImage, poInfo } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentPhotoCategoryId, setCurrentPhotoCategoryId] = React.useState<string>('');
    const [uploadingCategory, setUploadingCategory] = React.useState<string | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
    const [imageToDelete, setImageToDelete] = React.useState<{ categoryId: string, imgSrc: string } | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handlePhotoClick = (id: string) => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng Save Report trước khi upload ảnh!', type: 'warning' };
            return;
        }
        setCurrentPhotoCategoryId(id);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && currentPhotoCategoryId && poInfo?.recNo) {
            const category = PHOTO_CATEGORIES.find(c => c.id === currentPhotoCategoryId);
            if (!category) return;

            setUploadingCategory(currentPhotoCategoryId);
            try {
                // Step 1: Get the PHP upload URL from backend (GetLoadData 651)
                const serverInfo: any = await getImageServerUrl_api();
                if (!serverInfo?.success || !serverInfo?.uploadUrl) {
                    toast.value = { ...toast.value, message: serverInfo?.error || 'Cannot get image server URL', type: 'error' };
                    return;
                }
                const uploadUrl = serverInfo.uploadUrl;
                const imageServerUrl = serverInfo.imageServerUrl;

                // Step 2: Upload each file DIRECTLY to PHP server (like EditPDFAndroid)
                const uploadedFileNames: string[] = [];
                for (const file of Array.from(files)) {
                    const safeFileName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
                    try {
                        const phpResult = await uploadFileToPHP(uploadUrl, file, safeFileName);
                        if (phpResult.success) {
                            uploadedFileNames.push(safeFileName);
                        } else {
                            console.warn('PHP upload failed:', phpResult.message);
                        }
                    } catch (err: any) {
                        console.error('PHP upload error:', err);
                        toast.value = { ...toast.value, message: 'Upload lỗi: ' + err.message, type: 'error' };
                    }
                }

                if (uploadedFileNames.length === 0) {
                    toast.value = { ...toast.value, message: 'Không upload được ảnh nào lên server', type: 'error' };
                    return;
                }

                // Step 3: Save file names to QCFinalImage DB via Java backend
                const dbResult: any = await saveImageRecord_api(
                    poInfo.recNo,
                    category.label,
                    category.types,
                    uploadedFileNames
                );

                if (dbResult?.success) {
                    toast.value = { ...toast.value, message: 'Upload ảnh thành công!', type: 'success' };
                    // Build full URLs for UI display
                    uploadedFileNames.forEach((fileName: string) => {
                        const fullUrl = `${imageServerUrl}ImageQCFINAL/${fileName}`;
                        addImage(currentPhotoCategoryId, fullUrl);
                    });
                } else {
                    toast.value = { ...toast.value, message: dbResult?.error || 'Lưu DB thất bại', type: 'error' };
                }
            } catch (e: any) {
                toast.value = { ...toast.value, message: String(e), type: 'error' };
            } finally {
                setUploadingCategory(null);
            }
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDeleteImage = (categoryId: string, imgSrc: string) => {
        setImageToDelete({ categoryId, imgSrc });
    };

    const confirmDeleteImage = async () => {
        if (!imageToDelete || !poInfo?.recNo) return;
        setIsDeleting(true);
        const { categoryId, imgSrc } = imageToDelete;
        const category = PHOTO_CATEGORIES.find(c => c.id === categoryId);
        if (!category) {
            setImageToDelete(null);
            setIsDeleting(false);
            return;
        }

        // Extract filename from the imgSrc
        const lastSlash = imgSrc.lastIndexOf('/');
        const fileName = lastSlash >= 0 ? imgSrc.substring(lastSlash + 1) : imgSrc;
        
        // Ensure we don't try to delete local blob URLs from backend
        if (imgSrc.startsWith('blob:')) {
            removeImage(categoryId, imgSrc);
            setImageToDelete(null);
            setIsDeleting(false);
            return;
        }

        try {
            const result: any = await deleteImage_api(poInfo.recNo, category.label, fileName);
            if (result?.success) {
                removeImage(categoryId, imgSrc);
                toast.value = { ...toast.value, message: 'Đã xóa ảnh thành công!', type: 'success' };
            } else {
                toast.value = { ...toast.value, message: result?.error || 'Lỗi khi xóa ảnh trên server', type: 'error' };
            }
        } catch (e: any) {
            toast.value = { ...toast.value, message: String(e), type: 'error' };
        } finally {
            setImageToDelete(null);
            setIsDeleting(false);
        }
    };

    return {
        images,
        poInfo,
        fileInputRef,
        uploadingCategory,
        selectedImage, setSelectedImage,
        imageToDelete, setImageToDelete,
        isDeleting,
        handlePhotoClick,
        handleFileChange,
        handleDeleteImage,
        confirmDeleteImage
    };
};
