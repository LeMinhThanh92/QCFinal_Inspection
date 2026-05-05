import { useCallback, useEffect, useRef, useState } from "react";
import debounce from 'debounce';
import {Box, InputAdornment, useTheme} from "@mui/material";
import { TextFieldMandatory } from "@/components/Field/TextFieldMandatory";
import SearchIcon from '@mui/icons-material/Search';

interface SearchTextComponentProps {
    searchText: string;
    searchWidth?: number;
    searchPlaceHolder: string;
    minSearchLength?: number;
    setSearchText?: (value: any) => void;
}

export const SearchTextComponent = (
    { searchText,
        searchWidth,
        searchPlaceHolder,
        minSearchLength = 0,
        setSearchText
    }: SearchTextComponentProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [searchValue, setSearchValue] = useState<string>(searchText);
    const theme = useTheme()
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const trimmedValue = event.target.value
        setSearchValue(trimmedValue);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setSearchText?.(searchValue);
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 0);
        }
    };
    const fetchDataSearch = useCallback(
        debounce(async (value: string | null) => {
            if (setSearchText) {
                setSearchText?.(value);
            }
        }, 1000),
        [setSearchText]
    );

    useEffect(() => {
        if (searchValue === searchText) return;

        if (searchValue.length === 0 || searchValue.length >= minSearchLength) {
            fetchDataSearch(searchValue);
        }
    }, [searchValue, fetchDataSearch, minSearchLength, searchText]);
    return (
        <Box>
            <TextFieldMandatory
                inputRef={inputRef}
                sx={{
                    width: searchWidth == null ? '320px' : searchWidth,
                    color: theme.color.text.o1,
                    paddingBottom: 0,
                }}
                variant='outlined'
                size='small'
                value={searchValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceHolder}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: (theme) => theme.color.text.o5 }} />
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    )
}