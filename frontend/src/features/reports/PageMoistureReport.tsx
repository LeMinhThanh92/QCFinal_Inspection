import React, { useState } from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';
import { DataGridView } from '@/components/DataGrid/DataGridView';
import { useAppStore } from '@/utils/states/useAppStore';
import { getMoistureReport_api } from '@/network/urls/inspection_api';
import { useExportExcel } from '@/hooks/feature_shared/useExportExcel';
import { toast } from '@/utils/states/state';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useLocale } from '@/utils/context/LocaleProvider';

export const PageMoistureReport = () => {
    const { t } = useLocale();
    const factory = useAppStore(state => state.factory);
    
    const today = new Date().toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    const { isLoadingData: isExporting, exportToExcel } = useExportExcel();

    const handleLoadData = async () => {
        if (!fromDate || !toDate) {
            toast.value = { ...toast.value, message: 'Vui lòng chọn từ ngày và đến ngày', type: 'warning' };
            return;
        }
        setLoading(true);
        try {
            const toDateObj = new Date(toDate);
            toDateObj.setDate(toDateObj.getDate() + 1);
            const apiToDate = toDateObj.toISOString().split('T')[0];

            const res = await getMoistureReport_api(factory, fromDate, apiToDate);
            let formattedData = Array.isArray(res) ? res : [];
            formattedData = formattedData.map(row => {
                const newRow = { ...row };
                Object.keys(newRow).forEach(key => {
                    const val = newRow[key];
                    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) {
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const dd = String(d.getDate()).padStart(2, '0');
                            const hh = String(d.getHours()).padStart(2, '0');
                            const min = String(d.getMinutes()).padStart(2, '0');
                            const ss = String(d.getSeconds()).padStart(2, '0');
                            newRow[key] = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
                        }
                    }
                });
                return newRow;
            });
            setData(formattedData);
            if (res && res.length === 0) {
                toast.value = { ...toast.value, message: t.common.noData, type: 'info' };
            }
        } catch (error) {
            console.error(error);
            toast.value = { ...toast.value, message: t.common.loadFailed, type: 'error' };
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportToExcel(
            async () => data,
            (d) => d,
            `Moisture_Report_${factory}`
        );
    };

    const columns = data.length > 0 
        ? Object.keys(data[0]).map(key => ({
            field: key,
            headerName: key,
            minWidth: 150,
            flex: 1
        }))
        : [];

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Moisture Report
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
                    onClick={handleLoadData}
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
