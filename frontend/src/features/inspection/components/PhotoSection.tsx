import React from 'react';
import { Box, Typography, Chip, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { usePhotoSection, PHOTO_CATEGORIES } from '@/hooks/feature_inspection/usePhotoSection';

// ══════════════════════════════════════════════════════
// ── Section 10: Photos ───────────────────────────────
// ══════════════════════════════════════════════════════
export const PhotoSection: React.FC = () => {

    const {
        images,
        fileInputRef,
        uploadingCategory,
        selectedImage, setSelectedImage,
        imageToDelete, setImageToDelete,
        isDeleting,
        handlePhotoClick,
        handleFileChange,
        handleDeleteImage,
        confirmDeleteImage
    } = usePhotoSection();

    return (
        <Box
            sx={{
                mb: 2,
                borderRadius: '12px',
                overflow: 'hidden',
                border: (t) => `1px solid ${t.color?.neutral?.o3 || '#e0e0e0'}`,
                backgroundColor: (t) => t.color?.background?.o1 || '#fff',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1B2722 0%, #2d3e36 100%)',
                    px: 2.5,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <CameraAltIcon sx={{ color: '#fff', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '0.3px' }}>
                    Photos
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', ml: 'auto' }}>
                    {Object.values(images).reduce((sum, arr) => sum + arr.length, 0)} ảnh
                </Typography>
            </Box>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Category Accordion List */}
            <Box sx={{ p: 0 }}>
                {PHOTO_CATEGORIES.map((category, catIdx) => {
                    const categoryImages = images[category.id] || [];
                    const isUploading = uploadingCategory === category.id;
                    const count = categoryImages.length;

                    return (
                        <Box 
                            key={category.id} 
                            sx={{ 
                                borderBottom: catIdx < PHOTO_CATEGORIES.length - 1
                                    ? (t: any) => `1px solid ${t.color?.neutral?.o3 || '#eee'}`
                                    : 'none',
                            }}
                        >
                            {/* Category Header Row */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 2,
                                    py: 1.5,
                                    gap: 1.5,
                                    backgroundColor: count > 0 ? 'rgba(57,181,74,0.04)' : 'transparent',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                {/* Category info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        color: (t: any) => t.color?.text?.o1 || '#333',
                                        lineHeight: 1.4,
                                    }}>
                                        {category.label}
                                    </Typography>
                                </Box>

                                {/* Badge count */}
                                {count > 0 && (
                                    <Chip
                                        label={count}
                                        size="small"
                                        sx={{
                                            height: 22,
                                            minWidth: 28,
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            backgroundColor: (t: any) => t.color?.primary?.o5 || '#39B54A',
                                            color: '#fff',
                                        }}
                                    />
                                )}

                                {/* Upload button */}
                                <IconButton
                                    size="small"
                                    disabled={isUploading}
                                    onClick={() => handlePhotoClick(category.id)}
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        backgroundColor: (t: any) => t.color?.primary?.o5 || '#39B54A',
                                        color: '#fff',
                                        '&:hover': {
                                            backgroundColor: (t: any) => t.color?.primary?.o6 || '#27A338',
                                            transform: 'scale(1.05)',
                                        },
                                        '&.Mui-disabled': {
                                            backgroundColor: '#ccc',
                                            color: '#fff',
                                        },
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    {isUploading 
                                        ? <CircularProgress size={18} sx={{ color: '#fff' }} /> 
                                        : <AddAPhotoIcon sx={{ fontSize: 18 }} />
                                    }
                                </IconButton>
                            </Box>

                            {/* Image Grid */}
                            {count > 0 && (
                                <Box sx={{
                                    px: 2,
                                    pb: 2,
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: 'repeat(3, 1fr)',
                                        sm: 'repeat(4, 1fr)',
                                        md: 'repeat(5, 1fr)',
                                        lg: 'repeat(6, 1fr)',
                                    },
                                    gap: 1,
                                }}>
                                    {categoryImages.map((imgSrc, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                position: 'relative',
                                                paddingTop: '100%', /* 1:1 aspect ratio */
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: (t: any) => `1px solid ${t.color?.neutral?.o3 || '#e0e0e0'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    transform: 'translateY(-2px)',
                                                    '& .delete-btn': { opacity: 1 },
                                                },
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={imgSrc}
                                                alt={`${category.label} ${idx + 1}`}
                                                onClick={() => setSelectedImage(imgSrc)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            {/* Delete overlay */}
                                            <Box
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImage(category.id, imgSrc);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(211,47,47,0.85)',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: 24,
                                                    height: 24,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    opacity: { xs: 1, md: 0 },
                                                    transition: 'opacity 0.2s, background-color 0.2s',
                                                    '&:hover': { backgroundColor: 'rgba(211,47,47,1)' },
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                                }}
                                            >
                                                ✕
                                            </Box>
                                            {/* Index label */}
                                            <Box sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                                                px: 0.5,
                                                py: 0.3,
                                            }}>
                                                <Typography sx={{ color: '#fff', fontSize: '10px', fontWeight: 600, textAlign: 'right' }}>
                                                    {idx + 1}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Image Viewer Lightbox */}
            {selectedImage && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.92)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <Box
                        component="img"
                        src={selectedImage}
                        alt="Enlarged view"
                        sx={{
                            maxWidth: '92vw',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            color: '#fff',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '50%',
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.35)' },
                            backdropFilter: 'blur(8px)',
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
                PaperProps={{ sx: { borderRadius: '12px' } }}
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
                            sx={{ mt: 2, width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: '8px' }} 
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={() => setImageToDelete(null)} 
                        disabled={isDeleting}
                        sx={{ 
                            color: (t) => t.color?.text?.o6 || '#6B7280',
                            borderRadius: '8px',
                            textTransform: 'none',
                        }}
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={confirmDeleteImage} 
                        variant="contained"
                        disabled={isDeleting}
                        sx={{ 
                            backgroundColor: '#d32f2f', 
                            color: '#fff',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: '#c62828',
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
