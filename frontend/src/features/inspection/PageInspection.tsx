import React from 'react';
import {
    Box, Tabs, Tab, Typography, Badge, Chip,
    SpeedDial, SpeedDialAction, SpeedDialIcon,
    useTheme, Tooltip, CircularProgress, Backdrop,
} from '@mui/material';

// ── Icons ────────────────────────────────────────────
import DescriptionIcon from '@mui/icons-material/Description';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BugReportIcon from '@mui/icons-material/BugReport';

// ── Components ───────────────────────────────────────
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

import { usePageInspection } from '@/hooks/feature_inspection/usePageInspection';

// ══════════════════════════════════════════════════════
// ── MAIN PAGE ────────────────────────────────────────
// ══════════════════════════════════════════════════════
export const PageInspection: React.FC = () => {
    const theme = useTheme();
    const {
        poInfo,
        hasData,
        activeTab,
        handleTabChange,
        SPEED_DIAL_ACTIONS,
        handleSpeedDialAction,
        confirmAction, setConfirmAction,
        handleConfirmAction,
        resultDialog, setResultDialog,
        submittingPivot,
    } = usePageInspection();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                backgroundColor: (t) => t.color?.background?.o1 || '#F5F5F9',
            }}
        >
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
