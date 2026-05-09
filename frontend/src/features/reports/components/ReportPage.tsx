import React from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';
import { DataGridView } from '@/components/DataGrid/DataGridView';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useLocale } from '@/utils/context/LocaleProvider';

interface ReportPageProps {
    /** Title displayed at the top of the page */
    title: string;
    /** Return value from useReportData hook */
    report: {
        fromDate: string;
        setFromDate: (v: string) => void;
        toDate: string;
        setToDate: (v: string) => void;
        data: any[];
        loading: boolean;
        isExporting: boolean;
        columns: any[];
        handleLoadData: (t: any) => Promise<void>;
        handleExport: () => void;
    };
}

/**
 * Shared report layout component with date pickers, Load Data + Export buttons, and DataGrid.
 * All report pages (Moisture, Inspection, CTQ) use this component.
 */
export const ReportPage: React.FC<ReportPageProps> = ({ title, report }) => {
    const { t } = useLocale();
    const {
        fromDate, setFromDate,
        toDate, setToDate,
        data, loading,
        isExporting,
        columns,
        handleLoadData,
        handleExport,
    } = report;

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                {title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
                <TextField
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />

                <Button
                    variant="contained"
                    onClick={() => handleLoadData(t)}
                    disabled={loading}
                    startIcon={<SearchIcon />}
                >
                    {t.common.loadData}
                </Button>

                <Button
                    variant="outlined"
                    onClick={handleExport}
                    disabled={isExporting || data.length === 0}
                    startIcon={<DownloadIcon />}
                    color="success"
                >
                    {t.common.export}
                </Button>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
                <DataGridView
                    rows={data.map((item, index) => ({ id: index, ...item }))}
                    columns={columns}
                    loading={loading}
                />
            </Box>
        </Box>
    );
};
