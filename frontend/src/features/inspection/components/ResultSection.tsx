import React from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useAppStore } from '@/utils/states/useAppStore';
import { getCheckPassFail_api } from '@/network/urls/inspection_api';

// ══════════════════════════════════════════════════════
// ── Section 12: Result ───────────────────────────────
// ══════════════════════════════════════════════════════
export const ResultSection: React.FC = () => {
    const theme = useTheme();
    const poInfo = useAppStore(state => state.poInfo);
    const recordedDefects = useAppStore(state => state.recordedDefects); // We listen to defects to re-trigger
    const [resultStatus, setResultStatus] = React.useState<'pass' | 'fail' | null>(null);
    const [checking, setChecking] = React.useState(false);

    const rejectedQty = parseInt(String(poInfo?.Rejected ?? poInfo?.rejected ?? 0), 10) || 0;
    const sampleSize = parseInt(String(poInfo?.sampleSize || poInfo?.SampleSize || poInfo?.Sample_Size || poInfo?.PlanQty || 0), 10) || 0;
    const acceptedQty = Math.max(0, sampleSize - rejectedQty);

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
