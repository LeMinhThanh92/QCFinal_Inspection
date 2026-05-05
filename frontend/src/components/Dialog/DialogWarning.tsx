import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, styled, Typography } from '@mui/material';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import { TextFieldMandatory } from '../Field/TextFieldMandatory';

interface DialogWarningDialogProps {
    open: boolean;
    title: string;
    titleConfirmed?: string;
    onClose: () => void;
    onDelete: () => void;
    isAlert?: boolean
}
const buttonStyles = {
    width: '100%',
    height: '48px !important',
    px: 2,
    py: 1,
    borderWidth: '2px',
    borderRadius: '4px',
    fontWeight: 700,
};

const CancelButton = styled(Button)({
    color: '#5E697C',
    borderColor: '#5E697C',
    ...buttonStyles,
});

const SubmitButton = styled(Button)(({ theme }) => ({
    ...buttonStyles,
    color: theme.palette.common.white,
}));
const StickyDialogActions = styled(DialogActions)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    height: '72px',
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',

}));
const DialogWarning: React.FC<DialogWarningDialogProps> = ({ open, title, titleConfirmed, onClose, onDelete, isAlert }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" sx={{ '& .MuiPaper-root': { borderRadius: '12px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ backgroundColor: '#FFF1F0', height: '145px', width: '145px', borderRadius: '150px', justifyContent: 'center', alignItems: 'center', display: 'flex', mb: '16px' }}>
                    <ErrorOutlinedIcon
                        sx={{ color: '#E80303', width: '108px', height: '108px' }} />
                </Box>
            </DialogTitle>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Box sx={{ width: '100%', marginBottom: 2 }}>
                    <Typography
                        sx={{
                            fontSize: '24px',
                            fontWeight: 400,
                            color: '#1B2722',
                            textAlign: 'center'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <Box sx={{ width: '100%', marginBottom: 2 }}>
                    <Typography
                        sx={{
                            fontSize: '24px',
                            fontWeight: 600,
                            color: '#1B2722',
                            textAlign: 'center'
                        }}
                    >
                        {titleConfirmed}
                    </Typography>
                </Box>
            </DialogContent>
            <StickyDialogActions>
                <CancelButton onClick={onClose} variant="outlined">
                    Back
                </CancelButton>
                {!isAlert && (
                    <SubmitButton
                        onClick={onDelete}
                        variant="contained"
                        color="primary"
                    >
                        Yes
                    </SubmitButton>
                )}
            </StickyDialogActions>
        </Dialog>
    );
};

export default DialogWarning;