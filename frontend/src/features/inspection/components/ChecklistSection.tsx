import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useAppStore } from '@/utils/states/useAppStore';

// ── Types ────────────────────────────────────────────
interface ChecklistItem {
    id: string;
    label: string;
    globalIndex: number;
}

interface ChecklistSectionProps {
    title: string;
    items: ChecklistItem[];
    hasComment?: boolean;
    commentPlaceholder?: string;
}

// ── Styles ───────────────────────────────────────────
const getButtonSx = (
    theme: Theme,
    status: 'conform' | 'non-conform' | 'na' | null,
    target: 'conform' | 'non-conform' | 'na'
) => {
    const isActive = status === target;

    const activeBgMap = {
        conform: theme.color?.primary?.o5 || '#39B54A',
        'non-conform': theme.color?.text?.o4 || '#E6352B',
        na: theme.color?.neutral?.o5 || '#989FB0',
    };

    return {
        borderRadius: 0,
        backgroundColor: isActive ? activeBgMap[target] : 'transparent',
        color: isActive ? '#fff' : theme.color?.text?.o1 || '#1B2722',
        fontWeight: 700,
        textTransform: 'none' as const,
        fontSize: '13px',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: isActive
                ? activeBgMap[target]
                : theme.color?.background?.o2 || '#F5F5F9',
        },
    };
};

// ── Component ────────────────────────────────────────
export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
    title,
    items,
    hasComment,
    commentPlaceholder,
}) => {
    const theme = useTheme();
    const checklistStatuses = useAppStore(state => state.checklistStatuses);
    const setChecklistStatus = useAppStore(state => state.setChecklistStatus);

    const handleSelect = (globalIndex: number, val: 'conform' | 'non-conform' | 'na') => {
        setChecklistStatus(globalIndex, val);
    };

    return (
        <Box
            sx={{
                mb: 2,
                borderRadius: '8px',
                overflow: 'hidden',
                border: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
            }}
        >
            {/* ── Header ── */}
            <Box
                sx={{
                    backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                    borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                    px: 2,
                    py: 1.5,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: '15px',
                        color: (t) => t.color?.text?.o1 || '#1B2722',
                    }}
                >
                    {title}
                </Typography>
            </Box>

            {/* ── Table Header ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 0.75,
                    backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                    borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                }}
            >
                <Typography sx={{ width: '40%', fontSize: '12px', fontWeight: 600, color: (t) => t.color?.text?.o12 || '#6B7280' }}>
                    Item
                </Typography>
                <Typography sx={{ width: '20%', fontSize: '12px', fontWeight: 600, color: (t) => t.color?.text?.o12 || '#6B7280', textAlign: 'center' }}>
                    Conform
                </Typography>
                <Typography sx={{ width: '30%', fontSize: '12px', fontWeight: 600, color: (t) => t.color?.text?.o12 || '#6B7280', textAlign: 'center' }}>
                    Non-Conform
                </Typography>
                <Typography sx={{ width: '10%', fontSize: '12px', fontWeight: 600, color: (t) => t.color?.text?.o12 || '#6B7280', textAlign: 'center' }}>
                    N/A
                </Typography>
            </Box>

            {/* ── Rows ── */}
            {items.map((item) => {
                const itemStatus = checklistStatuses[item.globalIndex] || 'conform'; // Default to conform if undefined
                return (
                    <Box
                        key={item.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'stretch',
                            minHeight: '48px',
                            borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                            backgroundColor: (t) => t.color?.background?.o1 || '#fff',
                            '&:hover': {
                                backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                            },
                            transition: 'background-color 0.15s ease',
                        }}
                    >
                        <Box sx={{ width: '40%', display: 'flex', alignItems: 'center', px: 2 }}>
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: (t) => t.color?.text?.o1 || '#1B2722',
                                }}
                            >
                                {item.label}
                            </Typography>
                        </Box>

                        <Button
                            onClick={() => handleSelect(item.globalIndex, 'conform')}
                            disableRipple
                            sx={{ width: '20%', ...getButtonSx(theme, itemStatus, 'conform') }}
                        >
                            Conform
                        </Button>

                        <Button
                            onClick={() => handleSelect(item.globalIndex, 'non-conform')}
                            disableRipple
                            sx={{ width: '30%', ...getButtonSx(theme, itemStatus, 'non-conform') }}
                        >
                            Non-Conform
                        </Button>

                        <Button
                            onClick={() => handleSelect(item.globalIndex, 'na')}
                            disableRipple
                            sx={{ width: '10%', ...getButtonSx(theme, itemStatus, 'na') }}
                        >
                            N/A
                        </Button>
                    </Box>
                );
            })}

            {/* ── Comment ── */}
            {hasComment && (
                <Box
                    sx={{
                        display: 'flex',
                        p: 1.5,
                        px: 2,
                        alignItems: 'center',
                        backgroundColor: (t) => t.color?.background?.o1 || '#fff',
                    }}
                >
                    <Typography
                        sx={{
                            width: '15%',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: (t) => t.color?.text?.o1 || '#1B2722',
                        }}
                    >
                        Comment
                    </Typography>
                    <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder={commentPlaceholder || 'Add a comment...'}
                        sx={{
                            ml: 2,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: (t) => t.color?.background?.o1 || '#fff',
                                borderRadius: '4px',
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};
