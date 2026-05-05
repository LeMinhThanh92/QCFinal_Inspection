import React from 'react';
import { Autocomplete, Button, IconButton, Stack, Typography, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TextFieldMandatory } from './TextFieldMandatory';

const StyledStack = styled(Stack)({
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '8px 8px',
    borderRadius:'8px',
    margin:0,
    transition: 'background-color 0.3s ease',
    '&:hover': {
        backgroundColor: '#f0f0f0',
    },
});

interface AutocompleteCreateProps {
    index?: any;
    label?: string;
    placeholder?: string;
    fieldID: string;
    value: string;
    inputValue: string;
    options: string[];
    onInputChange: (event: React.ChangeEvent<{}>, newInputValue: string) => void;
    onChange: (event: React.ChangeEvent<{}>, newValue: string | null) => void;
    handleCreate: (type: string, val: string) => void;
    noOptionsText: string;
    size: any;
    required: boolean
}

const AutocompleteCreate: React.FC<AutocompleteCreateProps> = ({
    index,
    label,
    placeholder,
    fieldID,
    value,
    inputValue,
    options,
    onInputChange,
    onChange,
    handleCreate,
    size,
    required
}) => (
    <Autocomplete
        key={index}
        id={index}
        value={value}
        inputValue={inputValue}
        onInputChange={onInputChange}
        options={options}
        onChange={onChange}
        noOptionsText={
            <StyledStack onClick={() => handleCreate(fieldID, inputValue)}>
                <AddIcon color='success' sx={{ fontWeight: 300 }}/>
                <Typography sx={{ fontWeight: 300 }}>
                    Create "{inputValue}"
                </Typography>
            </StyledStack>
        }
        renderInput={(params) => <TextFieldMandatory {...params} size={size} required={required} label={label} placeholder={placeholder} />}
    />
);

export default AutocompleteCreate;
