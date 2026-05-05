import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Slide,
    DialogActions,
    Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { TransitionProps } from "@mui/material/transitions";

// ---------------- BUTTON STYLES ----------------

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

// ---------------- TRANSITION ----------------

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// ---------------- STICKY FOOTER ----------------

const StickyDialogActions = styled(DialogActions)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.color?.background?.o2 ?? theme.palette.background.paper,
    zIndex: 1,
    padding: theme.spacing(1),
}));

// ---------------- COMPONENT ----------------

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    content: string;
    positiveText?: string;
    negativeText?: string;
    onPositive?: () => void;
    onNegative?: () => void;
    onClose?: () => void;
    positiveType?: "submit" | "arrange"; // để bạn chọn style nút OK
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                         open,
                                                         title,
                                                         content,
                                                         positiveText = "OK",
                                                         negativeText = "Cancel",
                                                         onPositive,
                                                         onNegative,
                                                         onClose,
                                                         positiveType = "submit",
                                                     }) => {
    const PositiveButton = positiveType === "arrange" ? ArrangeButton : SubmitButton;

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            onClose={onClose ?? onNegative}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
            </DialogContent>

            <StickyDialogActions>
                <CancelButton
                    variant="outlined"
                    onClick={onNegative}
                >
                    {negativeText}
                </CancelButton>

                <PositiveButton
                    variant="contained"
                    onClick={onPositive}
                >
                    {positiveText}
                </PositiveButton>
            </StickyDialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
