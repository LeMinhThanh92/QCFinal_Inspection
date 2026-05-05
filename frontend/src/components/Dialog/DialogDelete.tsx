import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, styled, Typography } from '@mui/material';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

interface DeleteRoleDialogProps {
    open: boolean;
    title: string;
    titleConfirmed?: string;
    text?: string;
    setText?: (value: string) => void;
    onClose: () => void;
    onDelete: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        minWidth: '30%',
        backgroundColor: '#F8F9FA',
    }
}));

const buttonStyles = {
    width: '100%',
    height: '48px',
    px: 3,
    py: 1.5,
    borderWidth: '2px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '16px',
    textTransform: 'none' as const,
    transition: 'all 0.3s ease',
};

const CancelButton = styled(Button)(({ theme }) => ({
    color: '#5E697C',
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    ...buttonStyles,
    '&:hover': {
        borderColor: '#5E697C',
        backgroundColor: 'rgba(94, 105, 124, 0.06)',
        transform: 'translateY(-1px)',
    },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    ...buttonStyles,
    color: theme.palette.common.white,
    backgroundColor: 'primary',
    boxShadow: '0 2px 8px rgba(232, 3, 3, 0.2)',
    '&:hover': {
        backgroundColor: 'primary',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(232, 3, 3, 0.3)',
    },
}));

const StickyDialogActions = styled(DialogActions)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    height: '88px',
    backgroundColor: '#F8F9FA',
    zIndex: 1,
    padding: theme.spacing(3),
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    borderTop: '1px solid #E5E7EB',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    '&::before': {
        content: '""',
        position: 'absolute',
        width: '245px',
        height: '75px',
        backgroundColor: '#FEE2E2',
        borderRadius: '150px',
        opacity: 0.5,
    },
}));

const DialogDelete: React.FC<DeleteRoleDialogProps> = ({
                                                           open,
                                                           title,
                                                           titleConfirmed,
                                                           onClose,
                                                           onDelete,
                                                           text,
                                                           setText
                                                       }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (setText) {
            setText(e.target.value);
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#F8F9FA',
                    pt: 4,
                    pb: 2,
                }}
            >
                <IconWrapper>
                    <ErrorOutlinedIcon
                        sx={{
                            color: '#DC2626',
                            width: '108px',
                            height: '108px',
                            position: 'relative',
                            zIndex: 1,
                            filter: 'drop-shadow(0 2px 8px rgba(220, 38, 38, 0.15))',
                        }}
                    />
                </IconWrapper>
            </DialogTitle>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#F8F9FA',
                    px: 4,
                    pb: 3,
                    pt: 1,
                }}
            >
                <Box sx={{ width: '100%', mb: 1.5 }}>
                    <Typography
                        sx={{
                            fontSize: '24px',
                            fontWeight: 400,
                            color: '#374151',
                            textAlign: 'center',
                            lineHeight: 1.4,
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                {titleConfirmed && (
                    <Box sx={{ width: '100%' }}>
                        <Typography
                            sx={{
                                fontSize: '24px',
                                fontWeight: 600,
                                color: '#1F2937',
                                textAlign: 'center',
                                lineHeight: 1.4,
                            }}
                        >
                            {titleConfirmed}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <StickyDialogActions>
                <CancelButton onClick={onClose} variant="outlined">
                    No
                </CancelButton>
                <SubmitButton
                    onClick={onDelete}
                    variant="contained"
                    color="primary"
                >
                    Yes
                </SubmitButton>
            </StickyDialogActions>
        </StyledDialog>
    );
};

export default DialogDelete;