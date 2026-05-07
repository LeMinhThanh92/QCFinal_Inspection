import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemButton, ListItemText, Checkbox, IconButton,
    useTheme, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import { useAppStore } from '@/utils/states/useAppStore';
import { getDefectTypes_api, getDefectCodes_api, loadOperations_api, addDefect_api, deleteDefect_api, getRecordedDefects_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';

// ── Component ────────────────────────────────────────
export const DefectList: React.FC = () => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState<string | false>(false);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [loadingCodes, setLoadingCodes] = useState<Record<string, boolean>>({});

    const poInfo = useAppStore(state => state.poInfo);
    const setPoInfo = useAppStore(state => state.setPoInfo);
    const defectTypes = useAppStore(state => state.defectTypes);
    const defectCodesMap = useAppStore(state => state.defectCodesMap);
    const recordedDefects = useAppStore(state => state.recordedDefects);
    const setDefectTypes = useAppStore(state => state.setDefectTypes);
    const setDefectCodes = useAppStore(state => state.setDefectCodes);
    const addRecordedDefect = useAppStore(state => state.addRecordedDefect);
    const removeRecordedDefect = useAppStore(state => state.removeRecordedDefect);
    const initRecordedDefects = useAppStore(state => state.initRecordedDefects);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDefectCode, setSelectedDefectCode] = useState('');
    const [selectedDefectName, setSelectedDefectName] = useState('');
    const [selectedDefectType, setSelectedDefectType] = useState('');
    const [majorQty, setMajorQty] = useState('1');
    const [operations, setOperations] = useState<string[]>([]);
    const [selectedOperation, setSelectedOperation] = useState('');
    const [loadingOps, setLoadingOps] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Load Defect Types once ───────────────────────
    useEffect(() => {
        if (defectTypes.length === 0) {
            setLoadingTypes(true);
            getDefectTypes_api()
                .then((res: any) => {
                    if (res && res.length > 0) {
                        const types = res.map((item: any) => item.DefectType || Object.values(item)[0]);
                        setDefectTypes(types.filter(Boolean));
                    }
                })
                .catch(() => {
                    toast.value = { ...toast.value, message: 'Failed to load Defect Types', type: 'error' };
                })
                .finally(() => setLoadingTypes(false));
        }
    }, [defectTypes.length, setDefectTypes]);

    // ── Load Defect Codes on expand ──────────────────
    const handleExpand = (type: string) => {
        const isExpanded = expanded === type;
        setExpanded(isExpanded ? false : type);

        if (!isExpanded && !defectCodesMap[type] && !loadingCodes[type]) {
            setLoadingCodes(prev => ({ ...prev, [type]: true }));
            getDefectCodes_api(type)
                .then((res: any) => {
                    setDefectCodes(type, res && res.length > 0 ? res : []);
                })
                .catch(() => {
                    toast.value = { ...toast.value, message: `Failed to load codes for ${type}`, type: 'error' };
                })
                .finally(() => {
                    setLoadingCodes(prev => ({ ...prev, [type]: false }));
                });
        }
    };

    // ── Click a defect code → open dialog ────────────
    const handleDefectClick = (type: string, codeRaw: string) => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng Save report trước khi thêm lỗi!', type: 'warning' };
            return;
        }

        // Parse DefCode safely: use FIRST dash to split Code vs Description
        // e.g. "ST01-Broken Stitch" → code="ST01", name="Broken Stitch"
        // e.g. "ST01-Broken-Stitch" → code="ST01", name="Broken-Stitch"
        const firstDashIdx = codeRaw.indexOf('-');
        let defCode = codeRaw;
        let defName = codeRaw;
        if (firstDashIdx > 0) {
            defCode = codeRaw.substring(0, firstDashIdx).trim();
            defName = codeRaw.substring(firstDashIdx + 1).trim();
        }

        setSelectedDefectCode(defCode);
        setSelectedDefectName(defName);
        setSelectedDefectType(type);
        setMajorQty('1');
        setSelectedOperation('');
        setDialogOpen(true);

        // Load operations
        const poNo = poInfo?.poNumber || '';
        if (poNo) {
            setLoadingOps(true);
            loadOperations_api(poNo)
                .then((res: any) => {
                    if (res && res.length > 0) {
                        const ops = res.map((item: any) => item.OPERATION || Object.values(item)[0]?.toString() || '');
                        setOperations(ops.filter(Boolean));
                    } else {
                        setOperations([]);
                    }
                })
                .catch(() => setOperations([]))
                .finally(() => setLoadingOps(false));
        }
    };

    // ── Submit defect → call API ────────────────────
    const handleSubmitDefect = async () => {
        if (!poInfo?.recNo) return;
        const major = parseInt(majorQty, 10);
        if (isNaN(major) || major <= 0) {
            toast.value = { ...toast.value, message: 'Nhập số lượng Major hợp lệ!', type: 'warning' };
            return;
        }

        setSubmitting(true);
        try {
            const result: any = await addDefect_api(
                poInfo.recNo,
                poInfo.poNumber,
                selectedDefectCode,
                selectedDefectName,
                major,
                selectedOperation
            );

            if (result?.success) {
                // Update local poInfo with new accepted/rejected
                setPoInfo({ ...poInfo, Accpected: result.accepted, Rejected: result.rejected });
                // Add to local recorded defects list
                addRecordedDefect({ type: selectedDefectType, code: `${selectedDefectCode} - ${selectedDefectName}`, major });
                toast.value = { ...toast.value, message: `Đã thêm lỗi: ${selectedDefectCode} - Major: ${major}`, type: 'success' };
                setDialogOpen(false);
            } else {
                toast.value = { ...toast.value, message: result?.error || 'Thêm lỗi thất bại', type: 'error' };
            }
        } catch (e: any) {
            toast.value = { ...toast.value, message: String(e), type: 'error' };
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete defect → call API ────────────────────
    const handleDelete = async (defect: { id: string; code: string; type: string; major: number }) => {
        if (!poInfo?.recNo) return;

        // Parse the defDescription from the display format "CODE - Description"
        const firstDashIdx = defect.code.indexOf(' - ');
        const defDescription = firstDashIdx > 0 ? defect.code.substring(firstDashIdx + 3).trim() : defect.code;

        try {
            const result: any = await deleteDefect_api(poInfo.recNo, defDescription);
            if (result?.success) {
                setPoInfo({ ...poInfo, Accpected: result.accepted, Rejected: result.rejected });
                removeRecordedDefect(defect.id);
                toast.value = { ...toast.value, message: 'Đã xóa defect thành công', type: 'success' };
            } else {
                toast.value = { ...toast.value, message: result?.error || 'Xóa defect thất bại', type: 'error' };
            }
        } catch (e: any) {
            toast.value = { ...toast.value, message: String(e), type: 'error' };
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* ════════════════════════════════════════ */}
            {/* ── Defect Picker ───────────────────── */}
            {/* ════════════════════════════════════════ */}
            <Box
                sx={{
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
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <AddCircleOutlineIcon sx={{ mr: 1, color: (t) => t.color?.primary?.o5 || '#39B54A' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '15px', flex: 1, color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                        Add Defect
                    </Typography>
                    {loadingTypes && <CircularProgress size={20} />}
                </Box>

                {defectTypes.map((dtStr, idx) => (
                    <Accordion
                        key={idx}
                        expanded={expanded === dtStr}
                        onChange={() => handleExpand(dtStr)}
                        sx={{
                            boxShadow: 'none',
                            borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                            m: 0,
                            '&:before': { display: 'none' },
                            '&:last-child': { borderBottom: 'none' },
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 600, color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                                {dtStr}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            {loadingCodes[dtStr] ? (
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {defectCodesMap[dtStr]?.map((dc: any, i: number) => {
                                        // The API returns a single column with the format "Code-Description"
                                        const fullString = (dc.DefectCode || Object.values(dc)[0]) as string;
                                        return (
                                            <ListItemButton
                                                key={i}
                                                onClick={() => handleDefectClick(dtStr, fullString)}
                                                sx={{
                                                    borderTop: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                                                    pl: 4,
                                                    '&:hover': {
                                                        backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={fullString}
                                                    primaryTypographyProps={{
                                                        fontSize: '14px',
                                                        color: theme.color?.text?.o1 || '#1B2722',
                                                    }}
                                                />
                                            </ListItemButton>
                                        );
                                    })}
                                    {(!defectCodesMap[dtStr] || defectCodesMap[dtStr].length === 0) && (
                                        <Typography
                                            sx={{
                                                p: 2,
                                                textAlign: 'center',
                                                color: (t) => t.color?.neutral?.o5 || '#989FB0',
                                                fontSize: '14px',
                                            }}
                                        >
                                            No defect codes found.
                                        </Typography>
                                    )}
                                </List>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            {/* ════════════════════════════════════════ */}
            {/* ── Recorded Defects List ───────────── */}
            {/* ════════════════════════════════════════ */}
            <Box
                sx={{
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
                        Recorded Defects ({recordedDefects.length})
                    </Typography>
                </Box>

                <List sx={{ minHeight: '80px', backgroundColor: (t) => t.color?.background?.o1 || '#fff' }}>
                    {recordedDefects.map(defect => (
                        <ListItem
                            key={defect.id}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDelete(defect)}
                                    sx={{ color: (t) => t.color?.text?.o4 || '#E6352B' }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                            sx={{
                                borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                                '&:last-child': { borderBottom: 'none' },
                            }}
                        >
                            <Checkbox
                                checked
                                sx={{ color: (t) => t.color?.primary?.o5 || '#39B54A', '&.Mui-checked': { color: (t) => t.color?.primary?.o5 || '#39B54A' } }}
                            />
                            <ListItemText
                                primary={`${defect.type}: ${defect.code}`}
                                secondary={`Major: ${defect.major}`}
                                primaryTypographyProps={{ fontWeight: 600, fontSize: '14px', color: theme.color?.text?.o1 || '#1B2722' }}
                                secondaryTypographyProps={{ fontSize: '12px', color: theme.color?.text?.o12 || '#6B7280' }}
                            />
                        </ListItem>
                    ))}
                    {recordedDefects.length === 0 && (
                        <Typography
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                color: (t) => t.color?.neutral?.o5 || '#989FB0',
                                fontSize: '14px',
                            }}
                        >
                            No defects recorded yet. Select from the list above to add.
                        </Typography>
                    )}
                </List>
            </Box>

            {/* ── Submit Button ── */}
            <Button
                variant="contained"
                fullWidth
                startIcon={<SendIcon />}
                sx={{
                    backgroundColor: (t) => t.color?.primary?.o5 || '#39B54A',
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: '16px',
                    textTransform: 'none',
                    borderRadius: '4px',
                    '&:hover': {
                        backgroundColor: (t) => t.color?.primary?.o6 || '#27A338',
                    },
                }}
            >
                Submit Inspection
            </Button>

            {/* ════════════════════════════════════════ */}
            {/* ── Add Defect Dialog ───────────────── */}
            {/* ════════════════════════════════════════ */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                    Add Defect
                </DialogTitle>
                <DialogContent dividers>
                    {/* Defect Info */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: (t) => t.color?.neutral?.o6 || '#6B7280', mb: 0.5 }}>
                            Defect Type
                        </Typography>
                        <Typography sx={{ fontWeight: 600 }}>{selectedDefectType}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: (t) => t.color?.neutral?.o6 || '#6B7280', mb: 0.5 }}>
                            Defect Code — Description
                        </Typography>
                        <Typography sx={{ fontWeight: 600 }}>{selectedDefectCode} — {selectedDefectName}</Typography>
                    </Box>

                    {/* Major Qty Input */}
                    <TextField
                        label="Major Quantity"
                        type="number"
                        fullWidth
                        value={majorQty}
                        onChange={(e) => setMajorQty(e.target.value)}
                        inputProps={{ min: 1 }}
                        sx={{ mb: 2 }}
                    />

                    {/* Operation Spinner */}
                    <FormControl fullWidth>
                        <InputLabel>Operation (optional)</InputLabel>
                        <Select
                            value={selectedOperation}
                            label="Operation (optional)"
                            onChange={(e) => setSelectedOperation(e.target.value)}
                            disabled={loadingOps}
                        >
                            <MenuItem value="">
                                <em>— None —</em>
                            </MenuItem>
                            {operations.map((op, idx) => (
                                <MenuItem key={idx} value={op}>{op}</MenuItem>
                            ))}
                        </Select>
                        {loadingOps && (
                            <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: '50%', mt: '-10px' }} />
                        )}
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: (t) => t.color?.text?.o6 || '#6B7280' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitDefect}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            backgroundColor: (t) => t.color?.primary?.o5 || '#39B54A',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: (t) => t.color?.primary?.o6 || '#27A338',
                            }
                        }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
