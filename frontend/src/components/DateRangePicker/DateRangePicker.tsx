import React, { memo, useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Popover, TextField } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { format, parse } from 'date-fns';
import Calendar from "@components/DateRangePicker/Calendar";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { TextFieldMandatory } from '../Field/TextFieldMandatory';

interface DateRangePickerProps {
    selectedDateRange: [Date | null, Date | null];
    setSelectedDateRange: (range: [Date | null, Date | null]) => void;
    minDate?: Date;
    maxDate?: Date;
    format?: string;
    placeholder?: string;
    showApplyCancelButtons?: boolean;
    onApply?: (range: [Date | null, Date | null]) => void;
    onCancel?: () => void;
    renderFooter?: () => React.ReactNode;
    handleKeyDown?: (e: React.KeyboardEvent) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> =
    memo(({
        selectedDateRange,
        setSelectedDateRange,
        minDate,
        maxDate,
        format: dateFormat = 'dd/MM/yyyy',
        placeholder = 'DD/MM/YYYY - DD/MM/YYYY',
        showApplyCancelButtons = false,
        onApply,
        onCancel,
        renderFooter,
        handleKeyDown
    }) => {
        const [inputValue, setInputValue] = useState('');
        const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

        const handleOpen = useCallback((event: any) => {
            setAnchorEl(event.currentTarget);
        }, []);

        const handleClose = useCallback(() => {
            setAnchorEl(null);
        }, []);

        const open = Boolean(anchorEl);
        const id = open ? 'date-range-picker-popover' : undefined;

        const formatDateRange = useCallback((start: Date | null, end: Date | null) => {
            if (start && end) {
                return `${format(start, dateFormat)} - ${format(end, dateFormat)}`;
            }
            return '';
        }, [dateFormat]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setInputValue(value);

            const dateRangeRegex = /^(\d{2}\/\d{2}\/\d{4}) - (\d{2}\/\d{2}\/\d{4})$/;
            if (dateRangeRegex.test(value)) {
                const [startStr, endStr] = value.split(' - ');

                let startDate = parse(startStr, 'dd/MM/yyyy', new Date());
                let endDate = parse(endStr, 'dd/MM/yyyy', new Date());

                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {

                    if (startDate > endDate) {
                        startDate = endDate;
                    } else if (endDate < startDate) {
                        endDate = startDate;
                    }

                    setSelectedDateRange([startDate, endDate]);

                    setInputValue(`${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`);
                }
            }
        };

        useEffect(() => {
            const timeout = setTimeout(() => {
                const dateRangeRegex = /^(\d{2}\/\d{2}\/\d{4}) - (\d{2}\/\d{2}\/\d{4})$/;
                if (inputValue && dateRangeRegex.test(inputValue)) {
                    if (onApply) {
                        onApply(selectedDateRange)
                    }
                }
            }, 1000);

            return () => clearTimeout(timeout);
        }, [inputValue]);

        return (
            <Box>
                <TextFieldMandatory
                    sx={{
                        width: '330px',
                    }}
                    size="small"
                    placeholder={placeholder}
                    value={inputValue || formatDateRange(selectedDateRange[0], selectedDateRange[1])}
                    onChange={handleInputChange}
                    InputProps={{
                        readOnly: false,
                        endAdornment: (
                            <IconButton onClick={handleOpen} sx={{ color: (theme)=> theme.color.text.o5}}>
                                {open ? (<KeyboardArrowUpIcon />) : (<KeyboardArrowDownIcon />)}
                            </IconButton>
                        ),
                        startAdornment: (
                            <CalendarToday sx={{ color: (theme)=> theme.color.text.o5, mr: 2 }} />
                        )
                    }}
                    inputProps={{
                        maxLength: 23,
                    }}
                    onKeyDown={handleKeyDown}
                />
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    sx={{ mt: 0.5, ml: -1 }}
                >
                    <Calendar
                        selectedDateRange={selectedDateRange}
                        setSelectedDateRange={setSelectedDateRange}
                        onClose={handleClose}
                        minDate={minDate}
                        maxDate={maxDate}
                        showApplyCancelButtons={showApplyCancelButtons}
                        onApply={onApply}
                        onCancel={onCancel}
                        renderFooter={renderFooter}
                    />
                </Popover>
            </Box>
        );
    });

export default DateRangePicker;
