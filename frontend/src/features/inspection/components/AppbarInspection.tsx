import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, useTheme, IconButton,
    CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    ToggleButton, ToggleButtonGroup, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import DialogFullScreen from '@/components/Dialog/Dialog';
import { getSearchPo_api, getLoadImages_api, getRecordedDefects_api, getPlanId_api, getInspectorId_api, getRecNo_api } from '@/network/urls/inspection_api';
import { useAppStore } from '@/utils/states/useAppStore';
import { useAuth } from '@/utils/context/AuthProvider';
import { toast } from '@/utils/states/state';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog';

export const AppbarInspection: React.FC = () => {
    const theme = useTheme();
    const [poInput, setPoInput] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [poResults, setPoResults] = useState<any[]>([]);

    // State for AQL Confirm Dialog
    const [confirmAqlOpen, setConfirmAqlOpen] = useState(false);
    const [pendingAql, setPendingAql] = useState<string | null>(null);

    const factory = useAppStore(state => state.factory);
    const aqlLevel = useAppStore(state => state.aqlLevel);
    const setAqlLevel = useAppStore(state => state.setAqlLevel);
    const poInfo = useAppStore(state => state.poInfo);
    const setPoInfo = useAppStore(state => state.setPoInfo);
    const clearAllData = useAppStore(state => state.clearAllData);
    const isPoLoaded = !!(poInfo && poInfo.poNumber);
    const { user, logout } = useAuth();
    const initChecklistStatuses = useAppStore(state => state.initChecklistStatuses);
    const initImages = useAppStore(state => state.initImages);
    const initRecordedDefects = useAppStore(state => state.initRecordedDefects);

    useEffect(() => {
        const verifyInspector = async () => {
            const userId = user?.account?.username || '';
            if (userId) {
                try {
                    const fetchedInspectorId = await getInspectorId_api(userId);
                    if (!fetchedInspectorId || fetchedInspectorId.trim() === '') {
                        toast.value = {
                            ...toast.value,
                            message: 'User này chưa được cập nhật User Pivot. Vui lòng liên hệ quản trị viên.',
                            type: 'error',
                        };
                        setTimeout(() => {
                            logout();
                        }, 2500);
                    }
                } catch (e) {
                    console.error('Failed to verify inspector ID on load', e);
                }
            }
        };
        verifyInspector();
    }, [user, logout]);

    const handleAqlChange = (event: React.MouseEvent<HTMLElement>, newAql: string | null) => {
        if (isPoLoaded) {
            setPendingAql(newAql);
            setConfirmAqlOpen(true);
            return;
        }
        setAqlLevel(newAql);
    };

    const handleConfirmAqlChange = () => {
        clearAllData();
        setAqlLevel(pendingAql);
        setConfirmAqlOpen(false);
        setPendingAql(null);
    };

    const handleCancelAqlChange = () => {
        setConfirmAqlOpen(false);
        setPendingAql(null);
    };

    const handleSearchPO = async () => {
        if (!aqlLevel) {
            toast.value = { ...toast.value, message: 'Please select an AQL Level first!', type: 'warning' };
            return;
        }
        if (!poInput.trim()) {
            toast.value = { ...toast.value, message: 'Please enter a PO Number', type: 'warning' };
            return;
        }

        setLoading(true);
        try {
            const results = await getSearchPo_api(poInput.trim(), factory);
            if (results && results.length > 0) {
                setPoResults(results);
                setDialogOpen(true);
            } else {
                toast.value = { ...toast.value, message: 'No PO found!', type: 'error' };
            }
        } catch (error: any) {
            toast.value = { ...toast.value, message: String(error), type: 'error' };
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPO = async (poItem: any) => {
        setDialogOpen(false); // Close dialog immediately for better UX
        
        const poNo = poItem.PONo || poItem.poNumber || poInput;
        const planRef = poItem.PlanRefNo || poItem.planRefNo || '';
        
        // 1. Get the actual inspectorId by calling getInspectorId_api with current login user
        let inspectorId = poItem.Inspector || poItem.inspector || '1'; // Default fallback
        try {
            const userId = user?.account?.username || '';
            if (userId) {
                const fetchedInspectorId = await getInspectorId_api(userId);
                if (!fetchedInspectorId || fetchedInspectorId.trim() === '') {
                    // User Pivot not configured — notify and force logout
                    toast.value = {
                        ...toast.value,
                        message: 'User này chưa được cập nhật User Pivot. Vui lòng liên hệ quản trị viên.',
                        type: 'error',
                    };
                    // Auto logout after a short delay so the user can read the message
                    setTimeout(() => {
                        logout();
                    }, 2500);
                    return;
                }
                inspectorId = fetchedInspectorId;
            }
        } catch (e) {
            console.error('Failed to get inspector ID', e);
        }

        // 2. Get planId asynchronously if not provided (checkpobook)
        let planId = poItem.PlanID || poItem.planId || '';
        try {
            if (!planId) {
                const fetchedPlanId = await getPlanId_api(poNo, factory, inspectorId, planRef);
                planId = fetchedPlanId || '';
            }
        } catch (e) {
            console.error('Failed to get plan ID', e);
        }

        // 3. Get recNo precisely from ADynamicApp 72 result
        const rawRecNo = poItem.RecNo || poItem.Unikey || poItem.unikey;
        let recNo = '';
        if (rawRecNo && rawRecNo !== '0' && rawRecNo !== 'null') {
            recNo = rawRecNo.toString().replace('trax_', '');
        } else {
            // As per C# code: recno = ""
            recNo = '';
        }

        // 4. Update the centralized poInfo state with clean variables
        setPoInfo({
            poNumber: poNo,
            sku: poItem.SKU || poItem.sku,
            supplier: poItem.CompanyName || poItem.supplier,
            totalQty: poItem.TotalQty || poItem.totalQty || poItem.POQty || 0,
            sampleSize: poItem.SampleSize || poItem.sampleSize || poItem.Sample_Size || poItem.PlanQty || 0,
            planRefNo: planRef,
            recNo: recNo,
            planId: planId,
            inspectorId: inspectorId,
            ...poItem
        });
        
        // Initialize the checklist statuses based on list1, list2, list3 from API
        initChecklistStatuses(poItem.list1 || poItem.List1 || '', poItem.list2 || poItem.List2 || '', poItem.list3 || poItem.List3 || '');
        
        // Load images and recorded defects
        try {
            // Fetch images
            const imagesData = await getLoadImages_api(poNo, planRef);
            if (imagesData && Array.isArray(imagesData)) {
                initImages(imagesData);
            }

            // Fetch recorded defects if RecNo exists
            if (recNo) {
                const defectsData = await getRecordedDefects_api(recNo);
                if (defectsData && Array.isArray(defectsData)) {
                    initRecordedDefects(defectsData);
                }
            } else {
                initRecordedDefects([]);
            }

        } catch (error) {
            console.error('Failed to load PO details (images/defects):', error);
        }

        // Set the search text field to the full selected PO
        setPoInput(poNo);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                gap: 2,
            }}
        >
            {/* Left: Title + Search */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: '20px',
                        color: (t) => t.color?.text?.o1 || '#1B2722',
                        whiteSpace: 'nowrap',
                    }}
                >
                    QC Final Inspection
                </Typography>

                <Tooltip title={isPoLoaded ? 'Đổi AQL sẽ reset PO hiện tại' : 'Chọn AQL Level trước khi Load PO'} arrow>
                    <ToggleButtonGroup
                        value={aqlLevel}
                        exclusive
                        onChange={handleAqlChange}
                        size="small"
                        sx={{
                            backgroundColor: '#fff',
                            height: '40px',
                            '& .MuiToggleButton-root': {
                                fontWeight: 600,
                                px: 2,
                                color: '#333',
                                border: '1px solid #ccc',
                                '&.Mui-selected': {
                                    color: '#d32f2f',
                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                    borderColor: '#d32f2f',
                                    '&:hover': {
                                        backgroundColor: 'rgba(211, 47, 47, 0.2)',
                                    }
                                },
                                '&.Mui-disabled': {
                                    opacity: 0.6,
                                },
                                '&.Mui-selected.Mui-disabled': {
                                    color: '#d32f2f',
                                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                }
                            }
                        }}
                    >
                        <ToggleButton value="Regular orders (AQL 1.0, Level I)">REGULAR</ToggleButton>
                        <ToggleButton value="Japan orders (AQL 1.0, Level II)">JAPAN</ToggleButton>
                        <ToggleButton value="100%inspection">100%</ToggleButton>
                    </ToggleButtonGroup>
                </Tooltip>

                <TextField
                    size="small"
                    placeholder="Enter PO Number..."
                    value={poInput}
                    onChange={(e) => setPoInput(e.target.value)}
                    sx={{
                        width: 280,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '4px',
                            backgroundColor: (t) => t.color?.background?.o1 || '#fff',
                        },
                    }}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: (t) => t.color?.neutral?.o5 || '#989FB0', mr: 1 }} />,
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchPO();
                    }}
                />

                <Button
                    variant="contained"
                    onClick={handleSearchPO}
                    disabled={loading}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '4px',
                        fontWeight: 700,
                        px: 3,
                        height: '40px',
                        backgroundColor: (t) => t.color?.primary?.o5 || '#39B54A',
                        '&:hover': {
                            backgroundColor: (t) => t.color?.primary?.o6 || '#27A338',
                        },
                    }}
                >
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Load PO'}
                </Button>
            </Box>

            {/* Right: User Info + Logout */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontWeight: 600, color: (t: any) => t.color?.text?.o1 || '#1B2722' }}>
                    {user?.account?.fullname || user?.account?.username}
                </Typography>
                <IconButton 
                    onClick={() => logout()}
                    sx={{ color: (t: any) => t.color?.error?.main || '#d32f2f' }}
                    title="Logout"
                >
                    <LogoutIcon />
                </IconButton>
            </Box>

            {/* PO Selection Dialog */}
            <DialogFullScreen
                open={dialogOpen}
                onTransitionExited={() => {}}
                title={`Select PO — ${poInput}`}
                width="md"
                dialogAction={{
                    handleClose: () => setDialogOpen(false),
                    handleSubmit: () => setDialogOpen(false),
                    disablePositiveButton: false,
                    positiveTextButton: 'Close',
                    negativeTextButton: 'Cancel'
                }}
            >
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    backgroundColor: theme.color?.primary?.o5 || '#39B54A',
                                }}
                            >
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PlanRefNo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PONo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>QtyTotal</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Inspector</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {poResults.map((item, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    onClick={() => handleSelectPO(item)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': {
                                            backgroundColor: theme.color?.background?.o2 || '#F5F5F9',
                                        },
                                    }}
                                >
                                    <TableCell>{item.PlanRefNo || item.planRefNo || 'N/A'}</TableCell>
                                    <TableCell>{item.PONo || item.poNumber || 'N/A'}</TableCell>
                                    <TableCell>{item.QtyTotal || item.totalQty || item.TotalQty || '0'}</TableCell>
                                    <TableCell>{item.Inspector || item.inspector || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogFullScreen>
            <ConfirmDialog
                open={confirmAqlOpen}
                title="Xác nhận thay đổi AQL"
                content="Đổi AQL Level sẽ xóa dữ liệu PO hiện tại. Bạn có chắc không?"
                positiveText="Đồng ý"
                negativeText="Hủy"
                onPositive={handleConfirmAqlChange}
                onNegative={handleCancelAqlChange}
            />
        </Box>
    );
};
