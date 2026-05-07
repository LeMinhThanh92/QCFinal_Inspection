import React, { useState } from 'react';
import {
    Box, Tabs, Tab, Typography, Badge, Chip,
    SpeedDial, SpeedDialAction, SpeedDialIcon,
    useTheme, Tooltip,
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
import { clearImages_api, exportTrans4mJson_api, saveAll_api } from '@/network/urls/inspection_api';
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
    const { poInfo, images, removeImage, checklistStatuses, setPoInfo } = useAppStore();
    const factory = useAppStore(state => state.factory);
    const aqlLevel = useAppStore(state => state.aqlLevel);

    const [confirmAction, setConfirmAction] = useState<{open: boolean, title: string, content: string, actionId: string | null}>({
        open: false, title: '', content: '', actionId: null
    });

    const hasData = poInfo && poInfo.recNo && poInfo.recNo !== '';

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const SPEED_DIAL_ACTIONS = [
        // If hasData is true, color is Red to mimic legacy app behavior
        { id: 'SAVE', icon: <SaveIcon />, name: hasData ? 'Save (Update)' : 'Save', color: hasData ? '#f44336' : '#4CAF50' },
        { id: 'CLEAR_IMAGE', icon: <ClearAllIcon />, name: 'Clear Images', color: '#FF9800' },
        { id: 'SUBMIT', icon: <UploadIcon />, name: 'Submit TRANS4M', color: '#E91E63' },
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
        } else if (actionId === 'SUBMIT') {
            if (!poInfo?.poNumber || !poInfo?.planRefNo || !poInfo?.recNo) {
                toast.value = { ...toast.value, message: 'PO chưa được tải hoặc thiếu dữ liệu!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: 'Xác nhận Submit',
                content: 'Hệ thống sẽ tạo file JSON và tải về máy. Tiếp tục?',
                actionId
            });
        } else {
            console.log(`Action clicked: ${actionId}`);
            // TODO: implement other actions
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
        } else if (actionId === 'SUBMIT') {
            toast.value = { ...toast.value, message: 'Đang tạo file JSON...', type: 'info' };
            try {
                const blob: any = await exportTrans4mJson_api(poInfo?.poNumber || '', poInfo?.planRefNo || '', poInfo?.recNo || '');
                
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                
                const dateStr = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
                link.setAttribute('download', `JsonTest_AQLOutbound_${poInfo?.poNumber}_${dateStr}.json`);
                
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                toast.value = { ...toast.value, message: 'Đã tải file JSON thành công!', type: 'success' };
            } catch (e: any) {
                toast.value = { ...toast.value, message: 'Lỗi: ' + String(e), type: 'error' };
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
                        key={action.name}
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
        </Box>
    );
};
