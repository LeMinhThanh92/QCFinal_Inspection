import React, { Children } from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent, InputLabel, styled } from '@mui/material';

export const InputLabelasterisk = styled(InputLabel)({
    '& .MuiInputLabel-asterisk': {
        color: 'red', // Change color to red
    },
});
interface CustomSelectProps {
  value: string;
  title: string;
  handleChangeSelected: (event: SelectChangeEvent) => void;
  size: any;
  required?:boolean;
  disabled?:boolean;
  children: React.ReactNode;
}

const SelectCustom: React.FC<CustomSelectProps> = ({ value, title, handleChangeSelected, size, required=false, disabled, children }) => {
  return (
    <FormControl fullWidth margin="normal" size={size}>
      <InputLabelasterisk id="demo-select-small-label" required={required}>
        {title}
      </InputLabelasterisk>
      <Select
        value={value}
        label={title}
        onChange={handleChangeSelected}
        labelId="demo-select-small-label"
        disabled={disabled}
      >
       {children}
      </Select>
    </FormControl>
  );
};

export default SelectCustom;