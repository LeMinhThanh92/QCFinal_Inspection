import React from 'react';
import { Box, Typography, Button, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useInspectionQuantities } from '@/hooks/feature_inspection/useInspectionQuantities';

// ══════════════════════════════════════════════════════
// ── Section 9: Inspection Quantities ─────────────────
// ══════════════════════════════════════════════════════
export const InspectionQuantities: React.FC = () => {

    const {
        poInfo,
        cartonDialogOpen, setCartonDialogOpen,
        cartonInputValue, setCartonInputValue,
        isUpdating,
        handleCartonClick,
        handleSaveCarton
    } = useInspectionQuantities();

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
