import React, { memo, ReactNode } from 'react';
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    LinearProgress,
    Slide,
    styled,
    Toolbar,
    Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

const buttonStyles = {
    width: '162px',
    px: 2,
    py: 1,
    height: '48px',
    borderWidth: '2px',
    borderRadius: '4px',
    fontWeight: 700,
};

const CancelButton = styled(Button)({
    color: '#5E697C',
    borderColor: '#5E697C',
    ...buttonStyles,
});

const ArrangeButton = styled(Button)({
    color: '#39B54A',
    borderColor: '#39B54A',
    ...buttonStyles,
});

const SubmitButton = styled(Button)(({ theme }) => ({
    ...buttonStyles,
    color: theme.palette.common.white,
}));

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const StickyDialogActions = styled(DialogActions)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.color.background.o2,
    zIndex: 1,
    padding: theme.spacing(1),
}));

interface FullViewDialogProps {
    title?: string;
    open: boolean;
    onTransitionExited: any;
    width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    dialogAction: {
        handleClose: any;
        handleSubmit: any;
        handleSubmitCreate?: any;
        disablePositiveButton: boolean;
        positiveTextButton: string;
        negativeTextButton: string;
        createTextButton?: string;
    };
    children: ReactNode
}

const DialogFullScreen: React.FC<FullViewDialogProps> = ({ title, onTransitionExited, width, open, dialogAction, children }) => {
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            onTransitionExited={onTransitionExited}
            fullWidth={true}
            maxWidth={width}
            onClose={dialogAction.handleClose}
        >
            <DialogAppBar title={title} />
            <Divider sx={{ borderColor: (theme)=>theme.color.background.o5}}/>
            <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
                <DialogContent className={"scrollY"} sx={{ flexGrow: 1,  height: '50vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: (theme) => theme.color.background.o2 }}>
                    {children}
                </DialogContent>
                <Divider sx={{ borderColor: (theme)=>theme.color.background.o5}}/>
                <StickyDialogActions>
                    <SubmitButton
                        disabled={dialogAction.disablePositiveButton}
                        onClick={dialogAction.handleSubmit}
                        variant="contained"
                        color="primary"
                    >
                        {dialogAction.positiveTextButton}
                    </SubmitButton>
                </StickyDialogActions>
            </Box>
        </Dialog>
    );
};

const DialogAppBar: React.FC<{ title?: string }> = memo(({ title }) => (
    <Toolbar sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%', backgroundColor: (theme) => theme.color.background.o2 }}>
        <Typography sx={{ fontSize: '24px', fontWeight: 600, color: (theme) => theme.color.text.o1 }} component="div">
            {title}
        </Typography>
    </Toolbar>
))

export default DialogFullScreen;
