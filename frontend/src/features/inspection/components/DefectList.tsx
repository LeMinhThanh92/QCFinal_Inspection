import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemButton, ListItemText, Checkbox, IconButton,
    useTheme, CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import { useAppStore } from '@/utils/states/useAppStore';
import { getDefectTypes_api, getDefectCodes_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';

// ── Types ────────────────────────────────────────────

// ── Component ────────────────────────────────────────
export const DefectList: React.FC = () => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState<string | false>(false);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [loadingCodes, setLoadingCodes] = useState<Record<string, boolean>>({});

    const defectTypes = useAppStore(state => state.defectTypes);
    const defectCodesMap = useAppStore(state => state.defectCodesMap);
    const recordedDefects = useAppStore(state => state.recordedDefects);
    const setDefectTypes = useAppStore(state => state.setDefectTypes);
    const setDefectCodes = useAppStore(state => state.setDefectCodes);
    const addRecordedDefect = useAppStore(state => state.addRecordedDefect);
    const removeRecordedDefect = useAppStore(state => state.removeRecordedDefect);

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

    const handleAddDefect = (type: string, code: string) => {
        addRecordedDefect({ type, code, major: 1 });
    };

    const handleDelete = (id: string) => {
        removeRecordedDefect(id);
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
                                        const code = dc.DefectCode || Object.values(dc)[0];
                                        const name = dc.DefectName || Object.values(dc)[1] || code;
                                        return (
                                            <ListItemButton
                                                key={i}
                                                onClick={() => handleAddDefect(dtStr, `${code} - ${name}`)}
                                                sx={{
                                                    borderTop: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                                                    pl: 4,
                                                    '&:hover': {
                                                        backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={`${code} - ${name}`}
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
                                    onClick={() => handleDelete(defect.id)}
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
        </Box>
    );
};
