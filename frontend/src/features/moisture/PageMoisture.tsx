import React from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Button, CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SyncIcon from '@mui/icons-material/Sync';
import SaveIcon from '@mui/icons-material/Save';

import { useMoisture } from '@/hooks/feature_moisture/useMoisture';

export const PageMoisture: React.FC = () => {
    const {
        poInfo,
        rows,
        loading,
        saving,
        handleLoadData,
        handleInputChange,
        handleCopyDown,
        handleSave
    } = useMoisture();

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
