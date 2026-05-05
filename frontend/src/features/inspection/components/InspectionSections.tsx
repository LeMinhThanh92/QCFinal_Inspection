import React, { useRef } from 'react';
import { Box, Typography, Button, useTheme, CircularProgress } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useAppStore } from '@/utils/states/useAppStore';
import { getCheckPassFail_api } from '@/network/urls/inspection_api';

// ══════════════════════════════════════════════════════
// ── Section 9: Inspection Quantities ─────────────────
// ══════════════════════════════════════════════════════
export const InspectionQuantities: React.FC = () => {
    const theme = useTheme();
    const poInfo = useAppStore(state => state.poInfo);

    const RowItem = ({ label, value }: { label: string; value: string | number }) => (
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
            <Typography sx={{ flex: 7, fontSize: '14px', color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                {value || 'N/A'}
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
                <RowItem label="Inspected Carton Numbers" value={poInfo?.CartonNum || poInfo?.CTNNo || ''} />
            </Box>
        </Box>
    );
};

// ══════════════════════════════════════════════════════
// ── Section 10: Photos ───────────────────────────────
// ══════════════════════════════════════════════════════
const PHOTO_CATEGORIES = [
    { label: 'China Hangtab', id: 'HANGTAB' },
    { label: 'Picture for special packaging (optional)', id: 'PACKAGING' },
    { label: 'Compare Sample vs. Actual', id: 'COMPARE' },
    { label: 'Exceptional development approval vs. Actual', id: 'EXCEPTIONAL' },
    { label: 'Defect photo (optional)', id: 'DEFECT' },
    { label: 'Measurements', id: 'MEASUREMENTS' },
];

export const PhotoSection: React.FC = () => {
    const theme = useTheme();
    const { images, addImage, removeImage } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentPhotoCategoryId, setCurrentPhotoCategoryId] = React.useState<string>('');
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const handlePhotoClick = (id: string) => {
        setCurrentPhotoCategoryId(id);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && currentPhotoCategoryId) {
            // For demo purposes, we create local object URLs. In production, this would upload to server.
            Array.from(files).forEach((file) => {
                const objectUrl = URL.createObjectURL(file);
                addImage(currentPhotoCategoryId, objectUrl);
            });
        }
        if (event.target) {
            event.target.value = '';
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
                    return (
                        <Box key={category.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<CameraAltIcon />}
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
                                                    removeImage(category.id, imgSrc);
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
