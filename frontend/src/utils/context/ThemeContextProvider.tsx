import React, { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider, Theme, alpha } from '@mui/material/styles';
import { } from '@mui/x-data-grid/themeAugmentation';

declare module '@mui/material/styles' {
    interface Theme {
        color: {
            primary: {
                o1: string;
                o2: string;
                o3: string;
                o4: string;
                o5: string;
                o6: string;
                o7: string;
                o8: string;
                o9: string;
                o10: string;
            },
            neutral: {
                o1: string;
                o2: string;
                o3: string;
                o4: string;
                o5: string;
                o6: string;
                o7: string;
                o8: string;
                o9: string;
                o10: string;
            },
            text: {
                o1?: string;
                o2?: string;
                o3?: string;
                o4?: string;
                o5?: string;
                o6?: string;
                o7?: string;
                o8?: string;
                o9?: string;
                o10?: string;
                o11?: string;
                o12?: string;
                o13?: string;
                o14?: string;
                o15?: string;
            },
            background: {
                o1?: string;
                o2?: string;
                o3?: string;
                o4?: string;
                o5?: string;
                o6?: string;
                o7?: string;
                o8?: string;
                o9?: string;
                o10?: string;
                o11?: string;
                o12?: string;
                o13?: string;
                o14?: string;
                o15?: string;
            };
            semantic: {
                successMain: string;
                successBg: string;
                successBorder: string;
                errorMain: string;
                errorBg: string;
                warningMain: string;
                warningBg: string;
                infoMain: string;
                infoBg: string;
            };
        }
    }

    interface ThemeOptions {
        color?: {
            primary?: {
                o1?: string;
                o2?: string;
                o3?: string;
                o4?: string;
                o5?: string;
                o6?: string;
                o7?: string;
                o8?: string;
                o9?: string;
                o10?: string;
            },
            neutral?: {
                o1?: string;
                o2?: string;
                o3?: string;
                o4?: string;
                o5?: string;
                o6?: string;
                o7?: string;
                o8?: string;
                o9?: string;
                o10?: string;
            },
            text?: {
                o1?: string;
                o2?: string;
                o3?: string;
                o4?: string;
                o5?: string;
                o6?: string;
                o7?: string;
                o8?: string;
                o9?: string;
                o10?: string;
                o11?: string;
                o12?: string;
                o13?: string;
                o14?: string;
                o15?: string;
            },
            background?: {
                o1?: string;
                o2?: string;
                o3?: string;
                o4?: string;
                o5?: string;
                o6?: string;
                o7?: string;
                o8?: string;
                o9?: string;
                o10?: string;
                o11?: string;
                o12?: string;
                o13?: string;
                o14?: string;
                o15?: string;
            };
            semantic?: {
                successMain?: string;
                successBg?: string;
                successBorder?: string;
                errorMain?: string;
                errorBg?: string;
                warningMain?: string;
                warningBg?: string;
                infoMain?: string;
                infoBg?: string;
            };
        }
    }
}

interface ThemeContextProps {
    toggleMode: () => void;
    mode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<'light' | 'dark'>(
        () => (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
    );

    const toggleMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    const theme = useMemo(() => {
        const isLight = mode === 'light';

        /* ─── Tokens: Single source of truth for every color ─── */
        const t = {
            // ── Brand / Primary green scale ──
            primaryO1: '#F1F8E8',
            primaryO2: '#DBEDC4',
            primaryO3: '#C3E09F',
            primaryO4: '#ABD478',
            primaryO5: '#39B54A',
            primaryO6: '#27A338',
            primaryO7: '#1C982D',
            primaryO8: '#0D891E',
            primaryO9: '#027C11',
            primaryO10: '#007005',

            // ── Neutral gray scale ──
            white: '#FFFFFF',
            neutralO2: '#F6F6FA',
            neutralO3: '#D2D6DE',
            neutralO4: '#B5BBC6',
            neutralO5: '#989FB0',
            neutralO6: '#828B9E',
            neutralO7: '#6C778D',
            neutralO8: '#5E697C',
            dark: '#1B2722',
            black: '#070D14',
            bodyDark: '#101316',

            // ── Mode-aware base pairs ──
            textPrimary: isLight ? '#1B2722' : '#FFFFFF',
            textBody: isLight ? '#101316' : '#FFFFFF',
            bgPaper: isLight ? '#FFFFFF' : '#101316',
            bgDefault: isLight ? '#F5F5F9' : '#2B2B30',

            // ── Disabled states ──
            disabledLight: '#BDBDBD',
            disabledDark: '#9E9E9E',

            // ── Calendar / Date picker hover ──
            hoverSubtle: isLight ? '#f0f0f0' : '#4F4F59',

            // ── Menu / Select ──
            menuSelectedBg: isLight ? '#E6F1E6' : '#2A4D32',
            menuHoverBg: isLight ? '#d0d0d0' : '#555555',

            // ── Autocomplete ──
            autocompleteBorder: '#3A3A3D',
            autocompleteSelectedBg: isLight ? '#F5FBF6' : '#2E3A30',

            // ── Semantic status ──
            successMain: '#4caf50',
            successLight: '#81c784',
            successDark: '#2e7d32',
            errorMain: '#dc2626',
            errorLight: '#ff8a80',
            errorDark: '#c62828',
            warningMain: '#ff9800',
            warningLight: '#ffb74d',
            warningDark: '#e65100',
            infoMain: '#2196f3',
            infoLight: '#64b5f6',
            infoDark: '#1565c0',
        };

        return createTheme({
            color: {
                primary: {
                    o1: t.primaryO1,
                    o2: t.primaryO2,
                    o3: t.primaryO3,
                    o4: t.primaryO4,
                    o5: t.primaryO5,
                    o6: t.primaryO6,
                    o7: t.primaryO7,
                    o8: t.primaryO8,
                    o9: t.primaryO9,
                    o10: t.primaryO10,
                },
                neutral: {
                    o1: t.white,
                    o2: t.neutralO2,
                    o3: t.neutralO3,
                    o4: t.neutralO4,
                    o5: t.neutralO5,
                    o6: t.neutralO6,
                    o7: t.neutralO7,
                    o8: t.neutralO8,
                    o9: t.dark,
                    o10: t.black,
                },
                text: {
                    o1: t.textPrimary,
                    o2: isLight ? '#B6820A' : '#D4A233',
                    o3: isLight ? '#0047FF' : '#3D7DFF',
                    o4: isLight ? '#E6352B' : '#FF6B5E',
                    o5: isLight ? t.neutralO5 : t.white,
                    o6: isLight ? t.primaryO8 : '#18A32A',
                    o7: isLight ? t.white : t.neutralO5,
                    o8: isLight ? '#3B3B3B' : '#A3A3A3',
                    o9: isLight ? t.primaryO10 : '#00A306',
                    o10: isLight ? t.white : t.dark,
                    o11: isLight ? '#97D8A0' : '#2E593A',
                    o12: isLight ? t.neutralO8 : t.white,
                    o13: isLight ? '#FAFAFA' : '#121212',
                    o14: isLight ? '#212121' : t.white,
                    o15: isLight ? '#f0f8ff' : '#1a3b4d',
                },
                background: {
                    o1: t.bgPaper,
                    o2: t.bgDefault,
                    o3: isLight ? '#E9E9ED' : '#3A3A40',
                    o4: isLight ? '#F9F9F9' : '#1A1A1A',
                    o5: isLight ? '#E0E0E0' : t.autocompleteBorder,
                    o6: isLight ? t.primaryO6 : '#1E7C2D',
                    o7: isLight ? '#DDDDE1' : '#3B3F47',
                    o8: isLight ? t.neutralO2 : '#3A3A42',
                    o9: isLight ? '#E1F4E4' : '#2B4D3A',
                    o10: isLight ? '#E6F1E6' : '#2B4D3A',
                    o11: isLight ? '#F5FBF6' : '#2E3A30',
                    o12: isLight ? '#F8F8F8' : '#1E1E1E',
                    o13: isLight ? t.white : '#2B2B30',
                    o14: isLight ? '#F5F5F5' : '#2E2E2E',
                    o15: isLight ? t.successLight : '#388e3c',
                },
                semantic: {
                    successMain: t.successMain,
                    successBg: isLight ? '#e8f5e9' : alpha(t.successMain, 0.1),
                    successBorder: isLight ? t.successLight : alpha(t.successMain, 0.3),
                    errorMain: t.errorMain,
                    errorBg: isLight ? '#ffebee' : alpha(t.errorMain, 0.1),
                    warningMain: t.warningMain,
                    warningBg: isLight ? '#fff3e0' : alpha(t.warningMain, 0.1),
                    infoMain: t.infoMain,
                    infoBg: isLight ? '#e3f2fd' : alpha(t.infoMain, 0.1),
                }
            },
            typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                button: {
                    textTransform: 'none',
                }
            },
            palette: {
                action: {
                    disabled: t.white,
                    disabledBackground: t.primaryO3,
                },
                primary: {
                    main: t.primaryO5,
                    contrastText: t.white,
                },
                secondary: {
                    main: t.primaryO5,
                    contrastText: isLight ? t.white : t.bodyDark,
                },
                background: {
                    default: t.bgDefault,
                    paper: t.bgPaper,
                },
                success: {
                    main: t.successMain,
                    light: t.successLight,
                    dark: t.successDark,
                    contrastText: t.white,
                },
                error: {
                    main: t.errorMain,
                    light: t.errorLight,
                    dark: t.errorDark,
                    contrastText: t.white,
                },
                warning: {
                    main: t.warningMain,
                    light: t.warningLight,
                    dark: t.warningDark,
                    contrastText: t.white,
                },
                info: {
                    main: t.infoMain,
                    light: t.infoLight,
                    dark: t.infoDark,
                    contrastText: t.white,
                }
            },
            components: {
                MuiPickersDay: {
                    styleOverrides: {
                        root: {
                            '&.Mui-selected': {
                                backgroundColor: isLight ? t.primaryO6 : '#1E7C2D',
                                color: t.white,
                                '&:hover': {
                                    backgroundColor: isLight ? t.primaryO6 : '#1E7C2D',
                                },
                            },
                            '&.Mui-disabled': {
                                color: `${isLight ? t.disabledLight : t.disabledDark} !important`,
                                opacity: 1,
                                pointerEvents: 'none',
                            },
                        },
                    },
                },
                MuiDateCalendar: {
                    styleOverrides: {
                        root: {
                            marginTop: 0,
                            backgroundColor: t.bgPaper,
                            color: `${t.textPrimary} !important`,
                            '& .MuiPickersDay-root': {
                                color: t.textPrimary,
                                '&:hover': {
                                    backgroundColor: t.hoverSubtle,
                                },
                            },
                            '& .MuiTypography-root': {
                                color: t.textPrimary,
                                '&:hover': {
                                    backgroundColor: t.hoverSubtle,
                                },
                            },
                            '& .MuiSvgIcon-root': {
                                color: t.textPrimary,
                            },
                        },
                    },
                },
                MuiDataGrid: {
                    styleOverrides: {
                        overlay: {
                            color: t.textPrimary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                    },
                },
                MuiButton: {
                    styleOverrides: {
                        root: {
                            minHeight: '48px',
                            '&.MuiButton-outlined': {
                                '&:disabled': {
                                    borderColor: `${t.neutralO3} !important`,
                                    color: `${t.neutralO5} !important`,
                                },
                            },
                            '&.MuiButton-contained': {
                                '&:disabled': {
                                    backgroundColor: t.neutralO3,
                                    color: `${t.neutralO5} !important`,
                                },
                            },
                        }
                    }
                },
                MuiInputBase: {
                    styleOverrides: {
                        root: {
                            minHeight: '48px !important',
                            color: t.textBody,
                            backgroundColor: t.bgPaper,
                            '&.Mui-disabled': {
                                color: `${t.textPrimary} !important`,
                            },
                        },
                        input: {
                            color: t.textBody,
                            '&::placeholder': {
                                color: isLight ? t.neutralO5 : t.white,
                                opacity: 1,
                            },
                            '&.Mui-disabled': {
                                color: t.textPrimary,
                            },
                        }
                    },
                },
                MuiOutlinedInput: {
                    styleOverrides: {
                        input: {
                            '&.Mui-disabled': {
                                color: t.textPrimary,
                                '-webkit-text-fill-color': t.textPrimary,
                                opacity: 1,
                            },
                        },
                    }
                },
                MuiSelect: {
                    styleOverrides: {
                        icon: {
                            color: t.textBody,
                        }
                    },
                },
                MuiMenuItem: {
                    styleOverrides: {
                        root: {
                            color: t.textBody,
                            '&.Mui-selected': {
                                backgroundColor: t.menuSelectedBg,
                            },
                            '&:hover': {
                                backgroundColor: t.menuHoverBg,
                                color: t.textBody,
                            },
                        },
                    },
                },
                MuiStepLabel: {
                    styleOverrides: {
                        label: {
                            color: t.textBody,
                            '&.Mui-active': {
                                color: t.textBody,
                            },
                            '&.Mui-completed': {
                                color: t.textBody,
                            },
                        },
                    },
                },
                MuiInputLabel: {
                    styleOverrides: {
                        root: {
                            color: t.textBody,
                            '&.Mui-disabled': {
                                color: `${t.textPrimary} !important`,
                            },
                        }
                    },
                },
                MuiAutocomplete: {
                    styleOverrides: {
                        paper: {
                            color: t.textBody,
                            backgroundColor: t.bgPaper,
                            boxShadow: `0px 4px 6px ${alpha(t.black, 0.1)}`,
                            border: isLight ? 'none' : `1px solid ${t.autocompleteBorder}`,
                        },
                        noOptions: {
                            padding: '10px 20px',
                            fontStyle: 'italic',
                            color: t.textPrimary,
                        },
                        option: {
                            '&[aria-selected="true"]': {
                                backgroundColor: `${t.autocompleteSelectedBg} !important`,
                            }
                        },
                    },
                },
                MuiTypography: {
                    styleOverrides: {
                        root: {
                            "&.Mui-disabled": {
                                color: `${t.textPrimary} !important`,
                            },
                        },
                    },
                },
            }
        });
    }, [mode]);
    const rootElement = document.documentElement;
    rootElement.style.setProperty('--background-color', theme.palette.background.default);
    return (
        <ThemeContext.Provider value={{ toggleMode, mode }}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeContextProvider');
    }
    return context;
};
