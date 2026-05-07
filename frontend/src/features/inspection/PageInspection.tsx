import React, { useState } from 'react';
import {
    Box, Tabs, Tab, Typography, Badge, Chip,
    SpeedDial, SpeedDialAction, SpeedDialIcon,
    useTheme, Tooltip, CircularProgress, Backdrop,
} from '@mui/material';

// ── Icons ────────────────────────────────────────────
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BugReportIcon from '@mui/icons-material/BugReport';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// ── Components ───────────────────────────────────────
import { AppbarInspection } from './components/AppbarInspection';
import { PoDetailAccordion } from './components/PoDetailAccordion';
import { ChecklistSection } from './components/ChecklistSection';
import { InspectionQuantities, PhotoSection, ResultSection } from './components/InspectionSections';
import { DefectList } from './components/DefectList';
import {
    GENERAL_ITEMS,
    FABRIC_ARTWORK_ITEMS,
    LABEL_ITEMS,
    PACKAGING_ITEMS,
    MEASUREMENTS_ITEMS,
} from './components/ChecklistConstants';
import { useAppStore } from '@/utils/states/useAppStore';
import { clearImages_api, exportTrans4mJson_api, saveAll_api, submitToPivot_api, SubmitToPivotResponse, clearPo_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog';

// ── Tab Panel Helper ─────────────────────────────────
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <Box
        role="tabpanel"
        hidden={value !== index}
        sx={{
            flex: 1,
            overflowY: 'auto',
            display: value === index ? 'flex' : 'none',
            justifyContent: 'center',
        }}
    >
        <Box sx={{ width: '100%', maxWidth: '900px', p: 2 }}>
            {children}
        </Box>
    </Box>
);

// ── Speed Dial Actions ───────────────────────────────
// We will move this inside the component to be dynamic based on state.

// ══════════════════════════════════════════════════════
// ── MAIN PAGE ────────────────────────────────────────
// ══════════════════════════════════════════════════════
export const PageInspection: React.FC = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const { poInfo, images, removeImage, checklistStatuses, setPoInfo, clearAllData, setAqlLevel } = useAppStore();
    const factory = useAppStore(state => state.factory);
    const aqlLevel = useAppStore(state => state.aqlLevel);

    const [confirmAction, setConfirmAction] = useState<{open: boolean, title: string, content: string, actionId: string | null}>({
        open: false, title: '', content: '', actionId: null
    });

    // ── Result dialog for SFTP submit feedback ──
    const [resultDialog, setResultDialog] = useState<{
        open: boolean;
        type: 'success' | 'warning' | 'error';
        title: string;
        content: string;
    }>({ open: false, type: 'success', title: '', content: '' });

    // ── Loading overlay for submit ──
    const [submittingPivot, setSubmittingPivot] = useState(false);

    const hasData = poInfo && poInfo.recNo && poInfo.recNo !== '';

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const SPEED_DIAL_ACTIONS = [
        // If hasData is true, color is Red to mimic legacy app behavior
        { id: 'SAVE', icon: <SaveIcon />, name: hasData ? 'Update' : 'Save', color: hasData ? '#f44336' : '#4CAF50' },
        { id: 'CLEAR_IMAGE', icon: <ClearAllIcon />, name: 'Clear Img', color: '#FF9800' },
        { id: 'CLEAR_PO', icon: <DeleteForeverIcon />, name: 'Clear PO', color: '#9C27B0' },
        { id: 'SUBMIT', icon: <UploadIcon />, name: 'Submit', color: '#E91E63' },
    ];

    // ── Build checklist lists from store ──
    const buildChecklistLists = () => {
        const conformIndexes: number[] = [];
        const nonConformIndexes: number[] = [];
        const naIndexes: number[] = [];

        for (let i = 0; i <= 26; i++) {
            const status = checklistStatuses[i] || 'conform';
            if (status === 'conform') conformIndexes.push(i);
            else if (status === 'non-conform') nonConformIndexes.push(i);
            else if (status === 'na') naIndexes.push(i);
        }

        return {
            conform: conformIndexes.join('|'),
            nonConform: nonConformIndexes.join('|'),
            na: naIndexes.join('|'),
        };
    };

    const handleSpeedDialAction = (actionId: string) => {
        if (actionId === 'SAVE') {
            if (!aqlLevel) {
                toast.value = { ...toast.value, message: 'Vui lòng chọn AQL Level trước!', type: 'warning' };
                return;
            }
            if (!poInfo?.poNumber) {
                toast.value = { ...toast.value, message: 'Vui lòng load PO trước!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: 'Xác nhận Lưu',
                content: `Bạn có chắc chắn muốn SAVE dữ liệu cho PO: ${poInfo.poNumber}?`,
                actionId
            });
        } else if (actionId === 'CLEAR_IMAGE') {
            if (!poInfo?.recNo) {
                toast.value = { ...toast.value, message: 'Chưa có dữ liệu để xóa ảnh!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: 'Xác nhận Xóa Ảnh',
                content: 'Bạn có chắc chắn muốn xóa toàn bộ ảnh của mã PO này không?',
                actionId
            });
        } else if (actionId === 'CLEAR_PO') {
            if (!poInfo?.poNumber || !poInfo?.planId || !poInfo?.planRefNo) {
                toast.value = { ...toast.value, message: 'Thiếu thông tin PO/PlanID/PlanRef để clear!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: '⚠️ Xác nhận Clear PO',
                content: `DELETE POs: ${poInfo.poNumber}\nPlanRef: ${poInfo.planRefNo}\nUser: ${poInfo.inspectorId || ''}\n\nHệ thống sẽ đánh dấu PO này là "(Fail)".\nHành động này KHÔNG THỂ hoàn tác!\n\nBạn có chắc chắn?`,
                actionId
            });
        } else if (actionId === 'SUBMIT') {
            if (!poInfo?.poNumber || !poInfo?.planRefNo || !poInfo?.recNo) {
                toast.value = { ...toast.value, message: 'PO chưa được tải hoặc thiếu dữ liệu!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: 'Xác nhận Submit SFTP',
                content: `Hệ thống sẽ upload toàn bộ ảnh và file JSON lên server Pivot88/TRANS4M cho PO: ${poInfo.poNumber}.\n\nQuá trình này có thể mất vài phút. Tiếp tục?`,
                actionId
            });
        } else {
            console.log(`Action clicked: ${actionId}`);
        }
    };

    const handleConfirmAction = async () => {
        const { actionId } = confirmAction;
        setConfirmAction({ ...confirmAction, open: false }); // close dialog immediately

        if (actionId === 'SAVE') {
            toast.value = { ...toast.value, message: 'Đang lưu dữ liệu...', type: 'info' };
            try {
                const lists = buildChecklistLists();
                const payload = {
                    poNumber: poInfo?.poNumber || '',
                    factory: factory,
                    inspectorId: poInfo?.inspectorId || '',
                    planRef: poInfo?.planRefNo || '',
                    aqlLevel: aqlLevel || '',
                    sampleSize: String(poInfo?.sampleSize || poInfo?.SampleSize || poInfo?.Sample_Size || ''),
                    totalQty: String(poInfo?.totalQty || poInfo?.TotalQty || poInfo?.QtyTotal || ''),
                    insQty: String(poInfo?.sampleSize || poInfo?.SampleSize || poInfo?.Sample_Size || poInfo?.totalQty || poInfo?.TotalQty || ''),
                    cartonNum: poInfo?.CartonNum || poInfo?.cartonNum || poInfo?.CTNNo || '',
                    checklistConform: lists.conform,
                    checklistNonConform: lists.nonConform,
                    checklistNA: lists.na,
                };

                const result: any = await saveAll_api(payload);

                if (result?.success) {
                    setPoInfo({
                        ...poInfo,
                        planId: result.planId || poInfo?.planId,
                        recNo: result.recNo || poInfo?.recNo,
                    });

                    const status = result.status || 'UNKNOWN';
                    if (status === 'fail') {
                        toast.value = { ...toast.value, message: '❌ FAIL — Saved but result is FAIL!', type: 'error' };
                    } else if (status === 'pass') {
                        toast.value = { ...toast.value, message: '✅ PASS — Saved successfully!', type: 'success' };
                    } else {
                        toast.value = { ...toast.value, message: `Saved! (${result.isNew ? 'Created New' : 'Updated'})`, type: 'success' };
                    }
                } else {
                    toast.value = { ...toast.value, message: result?.message || 'Lỗi khi lưu!', type: 'error' };
                }
            } catch (e: any) {
                toast.value = { ...toast.value, message: 'Lỗi: ' + String(e), type: 'error' };
            }
        } else if (actionId === 'CLEAR_IMAGE') {
            try {
                const result: any = await clearImages_api(poInfo?.recNo || '');
                if (result?.success) {
                    toast.value = { ...toast.value, message: 'Đã xóa toàn bộ ảnh thành công!', type: 'success' };
                    Object.keys(images).forEach(category => {
                        images[category].forEach(img => removeImage(category, img));
                    });
                } else {
                    toast.value = { ...toast.value, message: result?.error || 'Lỗi khi xóa ảnh', type: 'error' };
                }
            } catch (e: any) {
                toast.value = { ...toast.value, message: String(e), type: 'error' };
            }
        } else if (actionId === 'CLEAR_PO') {
            toast.value = { ...toast.value, message: 'Đang clear PO...', type: 'info' };
            try {
                const result: any = await clearPo_api({
                    poNumber: poInfo?.poNumber || '',
                    planId: poInfo?.planId || '',
                    planRef: poInfo?.planRefNo || '',
                });
                if (result?.success) {
                    // Reset ALL app state — like fresh app load
                    clearAllData();
                    setAqlLevel(null);
                    setActiveTab(0);

                    setResultDialog({
                        open: true,
                        type: 'success',
                        title: '✅ Clear PO thành công',
                        content: `${result.message}\n\nTất cả dữ liệu đã được reset.`,
                    });
                } else {
                    setResultDialog({
                        open: true,
                        type: 'error',
                        title: '❌ Clear PO thất bại',
                        content: result?.message || 'Lỗi không xác định',
                    });
                }
            } catch (e: any) {
                setResultDialog({
                    open: true,
                    type: 'error',
                    title: '❌ Lỗi',
                    content: `Lỗi kết nối: ${String(e)}`,
                });
            }
        } else if (actionId === 'SUBMIT') {
            setSubmittingPivot(true);
            toast.value = { ...toast.value, message: 'Đang upload lên Pivot88... Vui lòng chờ!', type: 'info' };
            try {
                const response: any = await submitToPivot_api({
                    poNumber: poInfo?.poNumber || '',
                    planRef: poInfo?.planRefNo || '',
                    recNo: poInfo?.recNo || '',
                    inspectorId: poInfo?.inspectorId || '',
                });

                // response = { success, message, fileName, imagesUploaded, imagesFailed, totalImages }
                const data: SubmitToPivotResponse = response;

                if (data.success) {
                    if (data.imagesFailed && data.imagesFailed > 0) {
                        // ── Partial success: some images failed ──
                        setResultDialog({
                            open: true,
                            type: 'warning',
                            title: '⚠️ Submit hoàn tất (có lỗi ảnh)',
                            content: `JSON đã upload thành công!\n\n` +
                                `📄 File: ${data.fileName}\n` +
                                `✅ Ảnh thành công: ${data.imagesUploaded}/${data.totalImages}\n` +
                                `❌ Ảnh thất bại: ${data.imagesFailed}/${data.totalImages}\n\n` +
                                `Lưu ý: Một số ảnh không upload được. Vui lòng kiểm tra lại trên Pivot88.`,
                        });
                    } else {
                        // ── Full success ──
                        setResultDialog({
                            open: true,
                            type: 'success',
                            title: '✅ Submitted COMPLETE',
                            content: `Toàn bộ dữ liệu đã upload lên Pivot88 thành công!\n\n` +
                                `📄 File: ${data.fileName}\n` +
                                `🖼️ Ảnh: ${data.imagesUploaded}/${data.totalImages} thành công`,
                        });
                    }
                } else {
                    // ── Failed ──
                    setResultDialog({
                        open: true,
                        type: 'error',
                        title: '❌ Submit THẤT BẠI',
                        content: `Lỗi: ${data.message}\n\nVui lòng kiểm tra kết nối mạng và thử lại.`,
                    });
                }
            } catch (e: any) {
                setResultDialog({
                    open: true,
                    type: 'error',
                    title: '❌ Submit THẤT BẠI',
                    content: `Lỗi kết nối: ${String(e)}\n\nVui lòng kiểm tra kết nối mạng và thử lại.`,
                });
            } finally {
                setSubmittingPivot(false);
            }
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
                backgroundColor: (t) => t.color?.background?.o1 || '#F5F5F9',
            }}
        >
            {/* ─── TOP: AppBar with PO Search ─── */}
            <AppbarInspection />

            {/* ─── PO Summary Strip (only visible when PO is loaded) ─── */}
            {poInfo && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 2,
                        py: 1,
                        backgroundColor: (t) => t.color?.background?.o2 || '#E8F5E9',
                        borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#ddd'}`,
                        overflowX: 'auto',
                        flexWrap: 'nowrap',
                    }}
                >
                    <Chip label={`PO: ${poInfo.poNumber}`} color="primary" variant="filled" sx={{ fontWeight: 700 }} />
                    {hasData && (
                        <Chip 
                            label="★ ĐÃ CÓ DATA (UPDATE)" 
                            sx={{ 
                                fontWeight: 800, 
                                backgroundColor: '#f44336', 
                                color: '#fff',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                    '0%': { opacity: 1 },
                                    '50%': { opacity: 0.7 },
                                    '100%': { opacity: 1 },
                                }
                            }} 
                        />
                    )}
                </Box>
            )}

            {/* ─── TAB BAR ─── */}
            <Box
                sx={{
                    borderBottom: (t) => `2px solid ${t.color?.neutral?.o3 || '#ddd'}`,
                    backgroundColor: (t) => t.color?.background?.o1 || '#fff',
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        minHeight: '56px',
                        '& .MuiTab-root': {
                            fontWeight: 700,
                            fontSize: '14px',
                            textTransform: 'none',
                            minHeight: '56px',
                        },
                    }}
                >
                    <Tab icon={<DescriptionIcon />} iconPosition="start" label="PO Info" />
                    <Tab
                        icon={<ChecklistIcon />}
                        iconPosition="start"
                        label="Checklist"
                    />
                    <Tab icon={<CameraAltIcon />} iconPosition="start" label="Photos" />
                    <Tab icon={<BugReportIcon />} iconPosition="start" label="Defects & Result" />
                </Tabs>
            </Box>

            {/* ═══════════════════════════════════════ */}
            {/* ─── TAB PANELS ─── */}
            {/* ═══════════════════════════════════════ */}

            {/* ─── Tab 0: PO Information ─── */}
            <TabPanel value={activeTab} index={0}>
                <PoDetailAccordion />
                <InspectionQuantities />
            </TabPanel>

            {/* ─── Tab 1: Checklist ─── */}
            <TabPanel value={activeTab} index={1}>
                <ChecklistSection title="General" items={GENERAL_ITEMS} hasComment commentPlaceholder="100%-57/30-57/30" />
                <ChecklistSection title="Fabric and artwork checklist" items={FABRIC_ARTWORK_ITEMS} hasComment />
                <ChecklistSection title="Label" items={LABEL_ITEMS} hasComment />
                <ChecklistSection title="Packaging" items={PACKAGING_ITEMS} hasComment />
                <ChecklistSection title="Measurements" items={MEASUREMENTS_ITEMS} hasComment />
            </TabPanel>

            {/* ─── Tab 2: Photos ─── */}
            <TabPanel value={activeTab} index={2}>
                <PhotoSection />
            </TabPanel>

            {/* ─── Tab 3: Defects & Result ─── */}
            <TabPanel value={activeTab} index={3}>
                <ResultSection />
                <DefectList />
            </TabPanel>

            {/* ─── FLOATING ACTION BUTTON (SpeedDial) ─── */}
            <SpeedDial
                ariaLabel="Inspection Actions"
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    '& .MuiFab-primary': {
                        backgroundColor: (t) => t.color?.primary?.o5 || '#39B54A',
                        '&:hover': { backgroundColor: (t) => t.color?.primary?.o6 || '#27A338' },
                        width: 64,
                        height: 64,
                    },
                }}
                icon={<SpeedDialIcon />}
            >
                {SPEED_DIAL_ACTIONS.map((action) => (
                    <SpeedDialAction
                        key={action.id}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        onClick={() => handleSpeedDialAction(action.id)}
                        FabProps={{
                            sx: {
                                backgroundColor: action.color,
                                color: '#fff',
                                '&:hover': { backgroundColor: action.color, filter: 'brightness(0.9)' },
                            },
                        }}
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    whiteSpace: 'nowrap',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    py: 0.5,
                                    px: 1.5,
                                },
                            },
                        }}
                    />
                ))}
            </SpeedDial>

            <ConfirmDialog
                open={confirmAction.open}
                title={confirmAction.title}
                content={confirmAction.content}
                positiveText="Xác nhận"
                negativeText="Hủy"
                onPositive={handleConfirmAction}
                onNegative={() => setConfirmAction({ ...confirmAction, open: false })}
            />

            {/* ─── RESULT DIALOG (after SFTP submit) ─── */}
            <ConfirmDialog
                open={resultDialog.open}
                title={resultDialog.title}
                content={resultDialog.content}
                positiveText="OK"
                negativeText="Đóng"
                onPositive={() => setResultDialog({ ...resultDialog, open: false })}
                onNegative={() => setResultDialog({ ...resultDialog, open: false })}
            />

            {/* ─── LOADING OVERLAY (during SFTP submit) ─── */}
            <Backdrop
                open={submittingPivot}
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <CircularProgress color="inherit" size={56} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Đang upload lên Pivot88...
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Vui lòng không đóng trang này
                </Typography>
            </Backdrop>
        </Box>
    );
};
