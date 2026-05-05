import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppStore } from '@/utils/states/useAppStore';

// ── Field Row ────────────────────────────────────────
const FieldRow = ({ label, value }: { label: string; value: string | number }) => (
    <Box
        sx={{
            display: 'flex',
            borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
            py: 1.5,
            px: 2,
            '&:last-child': { borderBottom: 'none' },
            '&:hover': { backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9' },
            transition: 'background-color 0.15s ease',
        }}
    >
        <Typography sx={{ flex: 4, fontWeight: 600, fontSize: '13px', color: (t) => t.color?.text?.o12 || '#6B7280' }}>
            {label}
        </Typography>
        <Typography sx={{ flex: 6, fontSize: '14px', fontWeight: 500, color: (t) => t.color?.text?.o1 || '#1B2722' }}>
            {value || 'N/A'}
        </Typography>
    </Box>
);

// ── Component ────────────────────────────────────────
export const PoDetailAccordion: React.FC = () => {
    const theme = useTheme();
    const poInfo = useAppStore(state => state.poInfo);
    const [expanded, setExpanded] = useState(true);

    return (
        <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{
                mb: 2,
                borderRadius: '8px !important',
                overflow: 'hidden',
                border: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                boxShadow: 'none',
                '&:before': { display: 'none' },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
                sx={{
                    backgroundColor: (t) => t.color?.primary?.o5 || '#39B54A',
                    color: '#fff',
                    minHeight: '48px',
                    '&.Mui-expanded': { minHeight: '48px' },
                    '& .MuiAccordionSummary-content': { my: 1 },
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: '15px' }}>PO & Inspection Detail</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, backgroundColor: (t) => t.color?.background?.o1 || '#fff' }}>
                <FieldRow label="Report Type" value={poInfo?.ReportType || 'Regular orders (AQL 1.0, Level I)'} />
                <FieldRow label="PO Number" value={poInfo?.poNumber || poInfo?.PONo || ''} />
                <FieldRow label="SKU Number" value={poInfo?.sku || poInfo?.SKU || ''} />
                <FieldRow label="SKU Name" value="N/A" />
                <FieldRow label="Style" value={poInfo?.Style || 'N/A'} />
                <FieldRow label="SKU Description" value="N/A" />
                <FieldRow label="Quantity" value={poInfo?.totalQty || poInfo?.QtyTotal || poInfo?.TotalQty || 'N/A'} />
                <FieldRow label="Color" value="N/A" />
                <FieldRow label="Size" value={poInfo?.ManuSize || 'N/A'} />
                <FieldRow label="Client" value="N/A" />
                <FieldRow label="Client PO#" value="N/A" />
                <FieldRow label="Department" value="N/A" />
                <FieldRow label="Origin" value="N/A" />
                <FieldRow label="Destination" value={poInfo?.ShipDest || 'N/A'} />
                <FieldRow label="Ship Mode" value={poInfo?.ShipMode || 'N/A'} />
                <FieldRow label="ETD" value="N/A" />
                <FieldRow label="Packing Type" value="Carton" />
                <FieldRow label="Inspection Name" value={poInfo?.Inspector || poInfo?.InspectorName || 'Inspector (Current User)'} />
                <FieldRow label="Supplier Name" value={poInfo?.supplier || poInfo?.CompanyName || 'N/A'} />
                <FieldRow label="Supplier ERP ID" value={poInfo?.ERPID || 'N/A'} />
                <FieldRow label="Factory ERP ID" value={poInfo?.ERPID ? `${poInfo.ERPID}001` : 'N/A'} />
            </AccordionDetails>
        </Accordion>
    );
};
