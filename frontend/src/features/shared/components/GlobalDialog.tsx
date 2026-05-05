import React, { useEffect } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Typography, Button } from '@mui/material';
import { toastDialog } from "@/utils/states/state.ts";
import { useSignalEffect } from "@preact/signals-react";
import SessionExpiredDialog from "@components/Dialog/SessionExpiredDialog.tsx";
import { useDisclosure } from "@/hooks/app/useDisclosure.ts";
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const GlobalDialog: React.FC = () => {
    const { isOpen, open, close } = useDisclosure(false);

    useSignalEffect(() => {
        if (toastDialog.value.message !== '') {
            open();
        } else {
            close();
        }
    });

    useEffect(() => {
        if (isOpen && toastDialog.value.duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, toastDialog.value.duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, toastDialog.value.duration]);

    const handleClose = () => {
        close();
        toastDialog.value = { ...toastDialog.value, message: '', isExpired: false };
    };

    const getIcon = (type: 'success' | 'error' | 'info' | 'warning') => {
        switch (type) {
            case 'success':
                return <CheckCircleOutlineIcon sx={{ color: '#4CAF50', width: '108px', height: '108px' }} />;
            case 'error':
                return <ErrorOutlinedIcon sx={{ color: '#E80303', width: '108px', height: '108px' }} />;
            case 'info':
                return <InfoOutlinedIcon sx={{ color: '#2196F3', width: '108px', height: '108px' }} />;
            case 'warning':
                return <WarningAmberIcon sx={{ color: '#FF9800', width: '108px', height: '108px' }} />;
            default:
                return null;
        }
    };

    const getBackgroundColor = (type: 'success' | 'error' | 'info' | 'warning') => {
        switch (type) {
            case 'success':
                return '#E8F5E9';
            case 'error':
                return '#FFEBEE';
            case 'info':
                return '#E3F2FD';
            case 'warning':
                return '#FFF3E0';
            default:
                return '#FFF';
        }
    };
    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: (theme)=> theme.color.background.o2 }}>
                <Box sx={{ backgroundColor: getBackgroundColor(toastDialog.value.type), height: '145px', width: '145px', borderRadius: '150px', justifyContent: 'center', alignItems: 'center', display: 'flex', mb: '16px' }}>
                    {getIcon(toastDialog.value.type)}
                </Box>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: (theme)=> theme.color.background.o2 }}>
                {toastDialog.value.isExpired ? (
                    <SessionExpiredDialog open={isOpen} onClose={handleClose} message={toastDialog.value.message} />
                ) : (
                    <Box sx={{ margin: 'auto' }}>
                        <Typography sx={{ fontSize: '24px', fontWeight: 600, color: (theme)=> theme.color.text.o1, textAlign: 'center' }}>
                            {toastDialog.value.message}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            {/* <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </Box> */}
        </Dialog>
    );
};

export default GlobalDialog;