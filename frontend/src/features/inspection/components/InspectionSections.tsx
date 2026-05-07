import React, { useRef, useState } from 'react';
import { Box, Typography, Button, useTheme, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useAppStore } from '@/utils/states/useAppStore';
import { getCheckPassFail_api, updateCartonNum_api, loadCtn_api, getImageServerUrl_api, uploadFileToPHP, saveImageRecord_api, deleteImage_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';

// ══════════════════════════════════════════════════════
// ── Section 9: Inspection Quantities ─────────────────
// ══════════════════════════════════════════════════════
export const InspectionQuantities: React.FC = () => {
    const theme = useTheme();
    const poInfo = useAppStore(state => state.poInfo);

    const setPoInfo = useAppStore(state => state.setPoInfo);
    const [cartonDialogOpen, setCartonDialogOpen] = useState(false);
    const [cartonInputValue, setCartonInputValue] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleCartonClick = async () => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng Save report cơ bản trước khi sửa Carton!', type: 'warning' };
            return;
        }
        
        let currentValue = poInfo?.CartonNum || poInfo?.CTNNo || '';
        setCartonInputValue(currentValue);
        setCartonDialogOpen(true);
        setIsUpdating(true);
        
        try {
            const poNo = poInfo?.poNumber || '';
            const planRef = poInfo?.planRefNo || '';
            if (poNo && planRef) {
                const fetchedCtn = await loadCtn_api(poNo, planRef);
                if (fetchedCtn) {
                    setCartonInputValue(fetchedCtn);
                }
            }
        } catch (e) {
            console.error('Failed to load ctn from API', e);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveCarton = async () => {
        if (!poInfo?.recNo) return;
        setIsUpdating(true);
        try {
            await updateCartonNum_api(poInfo.recNo, cartonInputValue);
            setPoInfo({ ...poInfo, CartonNum: cartonInputValue, CTNNo: cartonInputValue });
            toast.value = { ...toast.value, message: 'Đã cập nhật Carton Number thành công', type: 'success' };
            setCartonDialogOpen(false);
        } catch (e: any) {
            toast.value = { ...toast.value, message: String(e), type: 'error' };
        } finally {
            setIsUpdating(false);
        }
    };

    const RowItem = ({ label, value, onClickValue }: { label: string; value: string | number; onClickValue?: () => void }) => (
        <Box
            sx={{
                display: 'flex',
                py: 1.5,
                px: 2,
                alignItems: 'center',
                minHeight: '48px',
                borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                '&:last-child': { borderBottom: 'none' },
            }}
        >
            <Typography sx={{ flex: 3, fontWeight: 700, fontSize: '14px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                {label}
            </Typography>
            <Typography 
                sx={{ 
                    flex: 7, 
                    fontSize: '14px', 
                    color: onClickValue ? (t: any) => t.color?.primary?.main || '#1976d2' : (t: any) => t.color?.text?.o1 || '#1B2722',
                    cursor: onClickValue ? 'pointer' : 'inherit',
                    textDecoration: onClickValue ? 'underline' : 'none',
                    '&:hover': onClickValue ? { color: (t: any) => t.color?.primary?.dark || '#115293' } : {}
                }}
                onClick={onClickValue}
            >
                {value || (onClickValue ? 'Add Carton Number' : 'N/A')}
            </Typography>
        </Box>
    );

    return (
        <Box
            sx={{
                mb: 2,
                borderRadius: '8px',
                overflow: 'hidden',
                border: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
            }}
        >
            <Box
                sx={{
                    backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                    borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                    px: 2,
                    py: 1.5,
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                    Inspection Quantities
                </Typography>
            </Box>
            <Box sx={{ backgroundColor: (t) => t.color?.background?.o1 || '#fff' }}>
                <RowItem label="Booked Qty (Pcs)" value={poInfo?.totalQty || poInfo?.QtyTotal || poInfo?.TotalQty || poInfo?.POQty || ''} />
                <RowItem label="Inspected Qty (Pcs)" value={poInfo?.totalQty || poInfo?.QtyTotal || poInfo?.TotalQty || poInfo?.InspectedQty || ''} />
                <RowItem label="Sample Size" value={poInfo?.InsQTY || poInfo?.sampleSize || poInfo?.SampleSize || poInfo?.Sample_Size || poInfo?.PlanQty || ''} />
                <RowItem label="Inspected Carton Numbers" value={poInfo?.CartonNum || poInfo?.CTNNo || ''} onClickValue={handleCartonClick} />
            </Box>

            {/* Dialog Edit Carton */}
            <Dialog open={cartonDialogOpen} onClose={() => setCartonDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: (t) => t.color?.text?.o1 || '#1B2722' }}>Edit Carton Numbers</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 2, color: (t) => t.color?.neutral?.o6 || '#6B7280' }}>
                        Nhập các số carton cách nhau bởi dấu <strong>|</strong> (Ví dụ: 1|6|12|18|25|28)
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={6}
                        variant="outlined"
                        value={cartonInputValue}
                        onChange={(e) => setCartonInputValue(e.target.value)}
                        placeholder="1|6|12|18|25|28|35|42|45|51|55|59|66"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCartonDialogOpen(false)} sx={{ color: (t) => t.color?.text?.o6 || '#6B7280' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveCarton} 
                        variant="contained" 
                        disabled={isUpdating}
                        sx={{ 
                            backgroundColor: (t) => t.color?.primary?.o5 || '#39B54A', 
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: (t) => t.color?.primary?.o6 || '#27A338',
                            }
                        }}
                    >
                        {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// ══════════════════════════════════════════════════════
// ── Section 10: Photos ───────────────────────────────
// ══════════════════════════════════════════════════════
const PHOTO_CATEGORIES = [
    { label: 'China Hangtab', id: 'HANGTAB', types: 'Product' },
    { label: 'Picture for special packaging (optional)', id: 'PACKAGING', types: 'Product' },
    { label: 'Compare Sample vs. Actual', id: 'COMPARE', types: 'Product' },
    { label: 'Exceptional development approval vs. Actual', id: 'EXCEPTIONAL', types: 'Product' },
    { label: 'Defect photo (optional)', id: 'DEFECT', types: 'Product' },
    { label: 'Measurements', id: 'MEASUREMENTS', types: 'Measurements' },
];

export const PhotoSection: React.FC = () => {
    const theme = useTheme();
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

    return (
        <Box
            sx={{
                mb: 2,
                borderRadius: '8px',
                overflow: 'hidden',
                border: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
            }}
        >
            <Box
                sx={{
                    backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                    borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                    px: 2,
                    py: 1.5,
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                    Photos
                </Typography>
            </Box>

            <Box sx={{ p: 2, backgroundColor: (t) => t.color?.background?.o1 || '#fff', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Hidden file input */}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {PHOTO_CATEGORIES.map((category) => {
                    const categoryImages = images[category.id] || [];
                    const isUploading = uploadingCategory === category.id;
                    return (
                        <Box key={category.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                disabled={isUploading}
                                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CameraAltIcon />}
                                onClick={() => handlePhotoClick(category.id)}
                                sx={{
                                    backgroundColor: (t) => t.color?.primary?.o5 || '#39B54A',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    textTransform: 'none',

                                    borderRadius: '4px',
                                    py: 1.5,
                                    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
                                    '&:hover': {
                                        backgroundColor: (t) => t.color?.primary?.o6 || '#27A338',
                                        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {category.label} {categoryImages.length > 0 && `(${categoryImages.length})`}
                            </Button>
                            
                            {categoryImages.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                    {categoryImages.map((imgSrc, idx) => (
                                        <Box 
                                            key={idx} 
                                            sx={{ 
                                                position: 'relative', 
                                                width: 80, 
                                                height: 80, 
                                                borderRadius: 1, 
                                                overflow: 'hidden',
                                                border: (t) => `1px solid ${t.color?.neutral?.o3 || '#ddd'}`,
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={imgSrc}
                                                alt={`${category.label} ${idx + 1}`}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => setSelectedImage(imgSrc)}
                                            />
                                            <Box
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImage(category.id, imgSrc);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 2,
                                                    right: 2,
                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    '&:hover': { backgroundColor: 'rgba(255,0,0,0.8)' }
                                                }}
                                            >
                                                ✕
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Image Viewer Dialog */}
            {selectedImage && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <Box
                        component="img"
                        src={selectedImage}
                        alt="Enlarged view"
                        sx={{
                            maxWidth: '95vw',
                            maxHeight: '95vh',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            color: '#fff',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.4)' },
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        ✕
                    </Box>
                </Box>
            )}

            {/* Confirm Delete Dialog */}
            <Dialog 
                open={!!imageToDelete} 
                onClose={() => !isDeleting && setImageToDelete(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700, color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                    Xác nhận xóa ảnh
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" sx={{ color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                        Bạn có chắc chắn muốn xóa ảnh này không?
                    </Typography>
                    {imageToDelete?.imgSrc && (
                        <Box 
                            component="img" 
                            src={imageToDelete.imgSrc} 
                            sx={{ mt: 2, width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1 }} 
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setImageToDelete(null)} 
                        disabled={isDeleting}
                        sx={{ color: (t) => t.color?.text?.o6 || '#6B7280' }}
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={confirmDeleteImage} 
                        variant="contained"
                        disabled={isDeleting}
                        sx={{ 
                            backgroundColor: (t) => t.color?.text?.o4 || '#d32f2f', 
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: (t) => t.color?.text?.o4 || '#c62828',
                            }
                        }}
                    >
                        {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Xóa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// ══════════════════════════════════════════════════════
// ── Section 12: Result ───────────────────────────────
// ══════════════════════════════════════════════════════
export const ResultSection: React.FC = () => {
    const theme = useTheme();
    const poInfo = useAppStore(state => state.poInfo);
    const recordedDefects = useAppStore(state => state.recordedDefects); // We listen to defects to re-trigger
    const [resultStatus, setResultStatus] = React.useState<'pass' | 'fail' | null>(null);
    const [checking, setChecking] = React.useState(false);

    const rejectedQty = poInfo?.Rejected ?? poInfo?.rejected ?? 0;
    const acceptedQty = poInfo?.Accpected ?? poInfo?.accpected ?? poInfo?.Accepted ?? poInfo?.accepted ?? 0;

    React.useEffect(() => {
        const poNo = poInfo?.poNumber || '';
        const factory = poInfo?.factory || poInfo?.Factory || 'F1';
        const inspectorId = poInfo?.inspectorId || poInfo?.Inspector || '1';
        const planRef = poInfo?.planRefNo || '';

        if (poNo) {
            setChecking(true);
            getCheckPassFail_api(poNo, factory, inspectorId, planRef)
                .then((res: any) => {
                    setResultStatus(res === 'fail' ? 'fail' : 'pass');
                })
                .catch(() => {
                    setResultStatus('fail'); // Default fallback or maybe null
                })
                .finally(() => {
                    setChecking(false);
                });
        }
    }, [poInfo, recordedDefects.length]); // Re-check if PO changes or defects count changes

    return (
        <Box
            sx={{
                mb: 2,
                borderRadius: '8px',
                overflow: 'hidden',
                border: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                    borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                    px: 2,
                    py: 1.5,
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                    Inspection Result
                </Typography>
            </Box>

            {/* Pass / Fail Display */}
            <Box sx={{ display: 'flex', position: 'relative' }}>
                {checking && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
                <Box
                    sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 3,
                        backgroundColor: resultStatus === 'pass'
                            ? (theme.color?.primary?.o5 || '#39B54A')
                            : (theme.color?.background?.o1 || '#fff'),
                        color: resultStatus === 'pass' ? '#fff' : (theme.color?.text?.o6 || '#0D891E'),
                        borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                        borderRight: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                        transition: 'all 0.4s ease',
                        opacity: resultStatus === 'fail' ? 0.4 : 1,
                    }}
                >
                    <Typography sx={{ fontWeight: 800, fontSize: '20px' }}>✓ PASS</Typography>
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 3,
                        backgroundColor: resultStatus === 'fail'
                            ? (theme.color?.text?.o4 || '#E6352B')
                            : (theme.color?.background?.o1 || '#fff'),
                        color: resultStatus === 'fail' ? '#fff' : (theme.color?.text?.o4 || '#E6352B'),
                        borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                        transition: 'all 0.4s ease',
                        opacity: resultStatus === 'pass' ? 0.4 : 1,
                    }}
                >
                    <Typography sx={{ fontWeight: 800, fontSize: '20px' }}>✕ FAIL</Typography>
                </Box>
            </Box>

            {/* Major Summary */}
            <Box
                sx={{
                    backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                    borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                    px: 2,
                    py: 1,
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: '13px', color: (t) => t.color?.text?.o12 || '#6B7280' }}>
                    Major Defects Summary
                </Typography>
            </Box>
            <Box sx={{ backgroundColor: (t) => t.color?.background?.o1 || '#fff' }}>
                <Box
                    sx={{
                        display: 'flex',
                        py: 1.5,
                        px: 2,
                        borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                    }}
                >
                    <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '14px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                        Total Defects Found
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '14px', color: (t) => t.color?.text?.o4 || '#E6352B' }}>
                        {rejectedQty}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', py: 1.5, px: 2 }}>
                    <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '14px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                        Accept | Reject Qty
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '14px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                        {acceptedQty} | {rejectedQty}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
