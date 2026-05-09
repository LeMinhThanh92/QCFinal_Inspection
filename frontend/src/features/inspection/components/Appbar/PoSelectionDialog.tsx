import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import DialogFullScreen from '@/components/Dialog/Dialog';
import { useLocale } from '@/utils/context/LocaleProvider';

interface PoSelectionDialogProps {
    open: boolean;
    poInput: string;
    poResults: any[];
    onClose: () => void;
    onSelectPO: (poItem: any) => void;
}

export const PoSelectionDialog: React.FC<PoSelectionDialogProps> = ({ open, poInput, poResults, onClose, onSelectPO }) => {
    const theme = useTheme();
    const { t } = useLocale();

    return (
        <DialogFullScreen
            open={open}
            onTransitionExited={() => {}}
            title={`${t.inspection.selectPoTitle} — ${poInput}`}
            width="md"
            dialogAction={{
                handleClose: onClose,
                handleSubmit: onClose,
                disablePositiveButton: false,
                positiveTextButton: t.common.close,
                negativeTextButton: t.common.cancel
            }}
        >
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow
                            sx={{
                                backgroundColor: theme.color?.primary?.o5 || '#39B54A',
                            }}
                        >
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PlanRefNo</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PONo</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>QtyTotal</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Inspector</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {poResults.map((item, index) => (
                            <TableRow
                                key={index}
                                hover
                                onClick={() => onSelectPO(item)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': {
                                        backgroundColor: theme.color?.background?.o2 || '#F5F5F9',
                                    },
                                }}
                            >
                                <TableCell>{item.PlanRefNo || item.planRefNo || 'N/A'}</TableCell>
                                <TableCell>{item.PONo || item.poNumber || 'N/A'}</TableCell>
                                <TableCell>{item.QtyTotal || item.totalQty || item.TotalQty || '0'}</TableCell>
                                <TableCell>{item.Inspector || item.inspector || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DialogFullScreen>
    );
};
