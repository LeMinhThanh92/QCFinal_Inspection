import { useState } from 'react';

type ErrorDialogState = {
    open: boolean;
    message: string;
    onSuccess?: () => void;
};

export const useErrorDialog = () => {
    const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({
        open: false,
        message: '',
    });

    const showErrorDialog = (message: string, onSuccess?: () => void) => {
        setErrorDialog({
            open: true,
            message,
            onSuccess,
        });
    };

    const closeErrorDialog = () => {
        setErrorDialog({
            open: false,
            message: '',
        });
    };

    return {
        errorDialog,
        showErrorDialog,
        closeErrorDialog,
    };
};