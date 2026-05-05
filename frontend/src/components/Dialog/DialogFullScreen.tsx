import React, { memo, ReactNode } from 'react';
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    IconButton,
    Slide,
    styled,
    Toolbar,
    Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import { CancelButton, QueueButton, SubmitButton } from './types';

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
    height: '64px',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    borderTop: `1px solid ${theme.color.background.o5}`,
    padding: theme.spacing(2),
}));

interface FullViewDialogProps {
    title?: string;
    open: boolean;
    onTransitionExited: any;
    isEditMode?: boolean;
    dialogAction: {
        handleClose: any;
        handleQuickClose?: any;
        handleSubmit: any;
        handlePrint?: any;
        handleSubmitCreate?: any;
        disablePositiveButton: boolean;
        disableSubmitCreate?: boolean;
        positiveTextButton: string;
        negativeTextButton: string;
        createTextButton?: string;
        printTextButton?: string
    };
    isQueue?: boolean;
    isDetail?: boolean;
    children: ReactNode;
    actionType?: 'purchaseOrderEdit' | 'detail'
}

const DialogFullScreen: React.FC<FullViewDialogProps> = ({
    title,
    onTransitionExited,
    open,
    dialogAction,
    children,
    isQueue,
    isEditMode,
    isDetail,
    actionType
}) => {
    const renderActionButtons = () => {
        switch (actionType) {
            case 'purchaseOrderEdit':
                return (
                    <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                            <CancelButton
                                onClick={dialogAction.handlePrint}
                                variant="outlined"
                                startIcon={<LocalPrintshopOutlinedIcon />}
                            >
                                {dialogAction.printTextButton}
                            </CancelButton>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            <CancelButton onClick={dialogAction.handleClose} variant="outlined">
                                {dialogAction.negativeTextButton}
                            </CancelButton>

                            {isQueue && (
                                <QueueButton disabled={dialogAction.disableSubmitCreate} onClick={dialogAction.handleSubmitCreate} variant="outlined">
                                    {dialogAction.createTextButton}
                                </QueueButton>
                            )}


                            {!isDetail && (
                                <SubmitButton
                                    disabled={dialogAction.disablePositiveButton}
                                    onClick={dialogAction.handleSubmit}
                                    variant="contained"
                                    color="primary"
                                >
                                    {dialogAction.positiveTextButton}
                                </SubmitButton>
                            )}
                        </Box>
                    </Box>
                );
            case 'detail':
                return (
                    <CancelButton onClick={dialogAction.handleClose} variant="outlined">
                        {dialogAction.negativeTextButton}
                    </CancelButton>
                )
            default:
                return (
                    <>
                        <CancelButton onClick={dialogAction.handleClose} variant="outlined">
                            {dialogAction.negativeTextButton}
                        </CancelButton>

                        {isQueue && (
                            <QueueButton disabled={dialogAction.disableSubmitCreate} onClick={dialogAction.handleSubmitCreate} variant="outlined">
                                {dialogAction.createTextButton}
                            </QueueButton>
                        )}


                        {!isDetail && (
                            <SubmitButton
                                disabled={dialogAction.disablePositiveButton}
                                onClick={dialogAction.handleSubmit}
                                variant="contained"
                                color="primary"
                            >
                                {dialogAction.positiveTextButton}
                            </SubmitButton>
                        )}
                    </>
                );
        }
    };
    return (
        <Dialog fullScreen open={open} TransitionComponent={Transition}
            onTransitionExited={onTransitionExited}>
            <DialogAppBar title={title} onClose={dialogAction.handleClose} />
            <Divider sx={{ borderColor: (theme) => theme.color.background.o5 }} />
            <Box display="flex" flexDirection="column" sx={{ height: '100vh', backgroundColor: (theme) => theme.color.background.o2 }}>
                <DialogContent sx={{ flexGrow: 1, height: '80vh', display: 'flex', flexDirection: 'column', padding: '0 !important' }}>
                    {children}
                </DialogContent>
                <StickyDialogActions>
                    {renderActionButtons()}
                </StickyDialogActions>
            </Box>
        </Dialog>
    );
};

const DialogAppBar: React.FC<{ title?: string; onClose: () => void }> = memo(({ title, onClose }) => (
    <AppBar sx={{ position: 'relative', bgcolor: (theme) => theme.color.background.o1, border: 1, borderColor: (theme) => theme.color.background.o5 }} elevation={0}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                {title}
            </Typography>
            <IconButton edge="end" color="inherit" onClick={onClose}>
                <CloseIcon />
            </IconButton>
        </Toolbar>
    </AppBar>
))


export default DialogFullScreen;
