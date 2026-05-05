import { styled, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

export const TextFieldMandatory = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-asterisk': {
        color: 'red',
    },
    '& .MuiInputBase-input': {
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        boxSizing: 'border-box',
        '&::placeholder': {
            color: theme.color?.text?.o1 || '#000000',
            opacity: 1,
        },
    },
}));

export const TextFieldMandatoryForm = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-asterisk': {
        color: 'red',
    },
}));

export const DateMandatory = styled(DatePicker)({
    '& .MuiInputLabel-asterisk': {
        color: 'red', // Change color to red
    },
});