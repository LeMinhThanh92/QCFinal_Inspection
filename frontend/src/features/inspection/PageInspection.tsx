import React, { useState } from 'react';
import {
    Box, Tabs, Tab, Typography, Badge, Chip,
    SpeedDial, SpeedDialAction, SpeedDialIcon,
    useTheme, Tooltip,
} from '@mui/material';

// ── Icons ────────────────────────────────────────────
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import BarChartIcon from '@mui/icons-material/BarChart';
import LanguageIcon from '@mui/icons-material/Language';
import BuildIcon from '@mui/icons-material/Build';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
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
    const poInfo = useAppStore(state => state.poInfo);

    const hasData = poInfo && poInfo.recNo && poInfo.recNo !== '';

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const SPEED_DIAL_ACTIONS = [
        // If hasData is true, color is Red to mimic legacy app behavior
        { icon: <SaveIcon />, name: hasData ? 'Save (Update)' : 'Save', color: hasData ? '#f44336' : '#4CAF50' },
        { icon: <ImageIcon />, name: 'Save Images', color: '#2196F3' },
        { icon: <BarChartIcon />, name: 'Lines Chart', color: '#9C27B0' },
        { icon: <ClearAllIcon />, name: 'Clear Images', color: '#FF9800' },
        { icon: <DeleteSweepIcon />, name: 'Clear PO', color: '#f44336' },
        { icon: <LanguageIcon />, name: 'View Web', color: '#00BCD4' },
        { icon: <BuildIcon />, name: 'Rework Tracking', color: '#795548' },
        { icon: <UploadIcon />, name: 'Submit TRANS4M', color: '#E91E63' },
    ];

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
                    {poInfo.sku && <Chip label={`SKU: ${poInfo.sku}`} variant="outlined" size="small" />}
                    {poInfo.supplier && <Chip label={`Supplier: ${poInfo.supplier}`} variant="outlined" size="small" />}
                    {poInfo.totalQty && <Chip label={`Qty: ${poInfo.totalQty}`} variant="outlined" size="small" />}
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
                        onClick={() => console.log(`Action: ${action.name}`)}
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
        </Box>
    );
};
