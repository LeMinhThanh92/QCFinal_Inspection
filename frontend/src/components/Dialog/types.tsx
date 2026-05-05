import { Button, DialogActions, styled } from '@mui/material';

const buttonStyles = {
    minWidth: '162px',
    px: 2,
    py: 1,
    height: '48px',
    borderWidth: '1px',
    borderRadius: '4px',
    fontWeight: 700,
};

export const CancelButton = styled(Button)(({ theme }) => ({
    color: theme.color.text.o1,
    borderColor: theme.color.text.o1,
    ...buttonStyles,
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
    ...buttonStyles,
    color: theme.palette.common.white,
}));

export const StickyDialogActions = styled(DialogActions)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    height: '72px',
    backgroundColor: theme.color.background.o2,
    zIndex: 1,
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',

}));

export const StickyDialogActions1 = styled(DialogActions)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
}));

export const QueueButton = styled(Button)(({ theme }) => ({
    color: `${theme.color.primary.o5} !important`,
    borderColor: theme.color.primary.o5,
    ...buttonStyles,
}));
