import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Button, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SyncIcon from '@mui/icons-material/Sync';
import SaveIcon from '@mui/icons-material/Save';
import { useAppStore } from '@/utils/states/useAppStore';
import { toast } from '@/utils/states/state';
import { getMoisture_api, saveMoisture_api } from '@/network/urls/inspection_api';

export interface MoistureRowData {
    ctnNo: string;
    fabricComposition: string;
    gTop: string;
    gMid: string;
    gBot: string;
    cIn: string;
    cOut: string;
    mateStandard: string;
    cartonStandard: string;
}

export const PageMoisture: React.FC = () => {
    const poInfo = useAppStore(state => state.poInfo);
    const [rows, setRows] = useState<MoistureRowData[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initialize rows when PO changes
    useEffect(() => {
        if (!poInfo?.recNo) {
            setRows([]);
            return;
        }

        const cartonString = poInfo?.CartonNum || poInfo?.CTNNo || '';
        if (!cartonString) {
            setRows([]);
            return;
        }

        let ctnArray = cartonString.split('|').filter((c: string) => c.trim() !== '');
        
        // If there's a RecNo but no carton defined yet, default to at least 1 empty row
        if (ctnArray.length === 0) {
            ctnArray = ['1'];
        }
        
        // Just initialize rows locally
        const initialRows = ctnArray.map((ctn: string) => ({
            ctnNo: ctn,
            fabricComposition: '100%polyester recycle', // Default from C# app
            gTop: '',
            gMid: '',
            gBot: '',
            cIn: '',
            cOut: '',
            mateStandard: '',
            cartonStandard: ''
        }));
        
        setRows(initialRows);
    }, [poInfo]);

    const handleLoadData = async () => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng Load PO trước', type: 'error' };
            return;
        }
        
        setLoading(true);
        try {
            const fetchedData = await getMoisture_api(poInfo.recNo);
            
            setRows(prevRows => {
                return prevRows.map(row => {
                    const existingRow = fetchedData?.find((r: any) => r.CTNNo === row.ctnNo || r.ctnNo === row.ctnNo);
                    if (existingRow) {
                        return {
                            ...row,
                            fabricComposition: existingRow.FabricComposition || existingRow.fabricComposition || row.fabricComposition,
                            gTop: existingRow.G_Top || existingRow.gTop || '',
                            gMid: existingRow.G_Mid || existingRow.gMid || '',
                            gBot: existingRow.G_Bot || existingRow.gBot || '',
                            cIn: existingRow.C_In || existingRow.cIn || '',
                            cOut: existingRow.C_Out || existingRow.cOut || '',
                            mateStandard: existingRow.Mate_Standard || existingRow.mateStandard || '',
                            cartonStandard: existingRow.Carton_Standard || existingRow.cartonStandard || ''
                        };
                    }
                    return {
                        ...row,
                        gTop: '',
                        gMid: '',
                        gBot: '',
                        cIn: '',
                        cOut: '',
                        mateStandard: '',
                        cartonStandard: ''
                    };
                });
            });
            toast.value = { ...toast.value, message: 'Tải dữ liệu Moisture thành công', type: 'success' };
        } catch (error) {
            console.error("Failed to load moisture data", error);
            toast.value = { ...toast.value, message: 'Lỗi khi tải dữ liệu Moisture', type: 'error' };
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (index: number, field: keyof MoistureRowData, value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    // Replicates the LongClick behavior to copy first row values to all other rows
    const handleCopyDown = () => {
        if (rows.length <= 1) return;
        
        const firstRow = rows[0];
        const newRows = rows.map((row, index) => {
            if (index === 0) return row;
            return {
                ...row,
                fabricComposition: firstRow.fabricComposition,
                gTop: firstRow.gTop,
                gMid: firstRow.gMid,
                gBot: firstRow.gBot,
                cIn: firstRow.cIn,
                cOut: firstRow.cOut,
                mateStandard: firstRow.mateStandard,
                cartonStandard: firstRow.cartonStandard,
            };
        });
        setRows(newRows);
        toast.value = { ...toast.value, message: 'Đã copy dữ liệu dòng 1 xuống các dòng dưới', type: 'success' };
    };

    const handleSave = async () => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng tải PO trước khi lưu', type: 'warning' };
            return;
        }
        
        setSaving(true);
        try {
            await saveMoisture_api(poInfo.recNo, rows);
            toast.value = { ...toast.value, message: 'Lưu dữ liệu Moisture thành công!', type: 'success' };
        } catch (error) {
            toast.value = { ...toast.value, message: 'Lỗi khi lưu dữ liệu', type: 'error' };
        } finally {
            setSaving(false);
        }
    };

    if (!poInfo?.recNo) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" color="textSecondary">
                    Vui lòng chọn PO trên thanh công cụ để nhập Moisture
                </Typography>
            </Box>
        );
    }

    if (rows.length === 0) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" color="textSecondary">
                    PO này chưa có cấu hình số Carton. Vui lòng thêm Carton Numbers ở màn hình Inspection trước.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: (t) => t.color?.text?.o1 || '#1B2722' }}>
                    Moisture Data Input
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
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
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyDown}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Copy Dòng 1 cho tất cả
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Save Data
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto', borderRadius: 2 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '60px' }}>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '150px' }}>Fabric Composition</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '80px' }}>Top</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '80px' }}>Middle</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '80px' }}>Bottom</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '80px' }}>Inside</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '80px' }}>Outside</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '100px' }}>M.Standard</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: '100px' }}>C.Standard</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Typography fontWeight="bold" align="center">{row.ctnNo}</Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={row.fabricComposition}
                                        onChange={(e) => handleInputChange(index, 'fabricComposition', e.target.value)}
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff' } }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" fullWidth value={row.gTop} onChange={(e) => handleInputChange(index, 'gTop', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" fullWidth value={row.gMid} onChange={(e) => handleInputChange(index, 'gMid', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" fullWidth value={row.gBot} onChange={(e) => handleInputChange(index, 'gBot', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" fullWidth value={row.cIn} onChange={(e) => handleInputChange(index, 'cIn', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" fullWidth value={row.cOut} onChange={(e) => handleInputChange(index, 'cOut', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" fullWidth value={row.mateStandard} onChange={(e) => handleInputChange(index, 'mateStandard', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" fullWidth value={row.cartonStandard} onChange={(e) => handleInputChange(index, 'cartonStandard', e.target.value)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
