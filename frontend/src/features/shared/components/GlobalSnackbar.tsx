import React from 'react';
import { Alert, Box, Grow, GrowProps, Snackbar } from '@mui/material';
import { toast } from "@/utils/states/state.ts";
import { useSignalEffect } from "@preact/signals-react";
import SessionExpiredDialog from "@components/Dialog/SessionExpiredDialog.tsx";
import { useDisclosure } from "@/hooks/app/useDisclosure.ts";

const GlobalSnackbar: React.FC = () => {
    const { isOpen, open, close } = useDisclosure(false)
    useSignalEffect(() => {
        if (toast.value.message != '') {
            open()
        } else {
            close()
        }

    });

    function GrowTransition(props: GrowProps) {
        return <Grow {...props} />;
    }

    const handleClose = () => {
        close()
        toast.value = { ...toast.value, message: '', isExpired: false };
    };

    return (
        <Box>
            {isOpen && <Box>

                {toast.value.isExpired ? <SessionExpiredDialog open={isOpen} onClose={handleClose} message={toast.value.message} /> :
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={isOpen}
                        TransitionComponent={GrowTransition}
                        autoHideDuration={toast.value.duration}
                        onClose={handleClose}>
                        <Alert severity={toast.value.type}>{toast.value.message}</Alert>
                    </Snackbar>
                }
            </Box>}
        </Box>

    );
};

export default GlobalSnackbar;
