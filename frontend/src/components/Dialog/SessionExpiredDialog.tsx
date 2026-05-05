import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Box, Typography } from "@mui/material";
import { useLoading } from "@/utils/context/LoadingProvider.tsx";
import { WarningAmberRounded } from "@mui/icons-material";
import { useLocale } from "@/utils/context/LocaleProvider";

interface SessionExpiredDialogProps {
    open: boolean;
    onClose: () => void;
    message?: string;
}

const SessionExpiredDialog: React.FC<SessionExpiredDialogProps> = ({ open, onClose, message }) => {
    const { setLoading } = useLoading();
    const { t } = useLocale();

    const handleLogin = () => {
        onClose();

        setLoading(true)

        setTimeout(() => {
            window.location.replace('/');
            setLoading(false);
        }, 500);

    };

    const isKicked = message === 'SESSION_KICKED';

    return (
        <Box>
            <Dialog open={open} >
                <Box sx={{ backgroundColor: (theme) => theme.color.background.o2, minWidth: 360 }}>
                    <DialogTitle sx={{ color: (theme) => theme.color.text.o1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberRounded color="warning" />
                        {isKicked ? t.session.kickedTitle : t.session.expiredTitle}
                    </DialogTitle>
                    <DialogContent sx={{ color: (theme) => theme.color.text.o1 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {isKicked ? t.session.kickedMessage : t.session.expiredMessage}
                        </Typography>
                        {isKicked && (
                            <Typography variant="body2" color="text.secondary">
                                {t.session.kickedHint}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleLogin} color="primary" variant="contained">
                            {t.session.loginAgain}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

        </Box>
    );
};

export default SessionExpiredDialog;
