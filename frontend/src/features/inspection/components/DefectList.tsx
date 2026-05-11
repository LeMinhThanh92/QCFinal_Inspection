import React from 'react';
import {
    Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemButton, ListItemText, Checkbox, IconButton,
    useTheme, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useDefectList } from '@/hooks/feature_inspection/useDefectList';

// ── Component ────────────────────────────────────────
export const DefectList: React.FC = () => {
    const theme = useTheme();
    const {
        expanded,
        loadingTypes,
        loadingCodes,
        defectTypes,
        defectCodesMap,
        recordedDefects,
        dialogOpen, setDialogOpen,
        selectedDefectCode,
        selectedDefectName,
        selectedDefectType,
        majorQty, setMajorQty,
        operations,
        selectedOperation, setSelectedOperation,
        loadingOps,
        submitting,
        handleExpand,
        handleDefectClick,
        handleSubmitDefect,
        handleDelete
    } = useDefectList();

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

            {/* Submit Button removed per user request */}

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
