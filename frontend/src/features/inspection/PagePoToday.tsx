import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { DataGridView } from '@/components/DataGrid/DataGridView';
import { GridColDef } from '@mui/x-data-grid';
import { getPoToday_api } from '@/network/urls/inspection_api';
import { useAppStore } from '@/utils/states/useAppStore';
import { toast } from '@/utils/states/state';
import moment from 'moment';

export const PagePoToday: React.FC = () => {
    const factory = useAppStore(state => state.factory);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLoadData = async () => {
        if (!factory) {
            toast.value = { ...toast.value, message: 'Không tìm thấy thông tin Factory', type: 'error' };
            return;
        }
        
        setLoading(true);
        try {
            const data = await getPoToday_api(factory);
            if (data && Array.isArray(data)) {
                // Sort descending by rnumber
                const sortedData = data.sort((a, b) => {
                    const numA = parseInt(a.rnumber || '0');
                    const numB = parseInt(b.rnumber || '0');
                    return numB - numA;
                });
                
                // Add an id for DataGrid
                const rowsWithId = sortedData.map((row, index) => ({
                    id: `row-${index}`,
                    ...row
                }));
                
                setRows(rowsWithId);
                toast.value = { ...toast.value, message: 'Đã tải xong dữ liệu PO Inspection Today', type: 'success' };
            }
        } catch (error) {
            console.error("Failed to load PO Inspection Today", error);
            toast.value = { ...toast.value, message: 'Lỗi tải danh sách PO', type: 'error' };
        } finally {
            setLoading(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'Inspector', headerName: 'Inspector', flex: 1, minWidth: 150 },
        { field: 'PONo', headerName: 'PONo', flex: 1, minWidth: 150 },
        { field: 'Status', headerName: 'Status', flex: 1, minWidth: 100 },
        { 
            field: 'datesubmit', 
            headerName: 'Date Submit', 
            flex: 1, 
            minWidth: 200,
            valueFormatter: (value: any) => {
                if (!value) return 'NULL';
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        { field: 'rnumber', headerName: 'rnumber', width: 100 },
    ];

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                    PO Inspection Today
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                    onClick={handleLoadData}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Load Data
                </Button>
            </Box>
            
            <Box sx={{ flex: 1, width: '100%', backgroundColor: 'white', borderRadius: 2 }}>
                <DataGridView
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    title="No PO found"
                    height="calc(100vh - 150px)"
                    disableColumnMenu
                />
            </Box>
        </Box>
    );
};
