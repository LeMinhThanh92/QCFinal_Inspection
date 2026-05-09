import React from 'react';
import {
    Box, Button, TextField, Typography, IconButton,
    CircularProgress, ToggleButton, ToggleButtonGroup, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppStore } from '@/utils/states/useAppStore';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog';
import { VERSION } from '@/components/constants/version';
import { useAppbarInspection } from '../hooks/useAppbarInspection';
import { PoSelectionDialog } from './Appbar/PoSelectionDialog';

export const AppbarInspection: React.FC = () => {
    const toggleDrawer = useAppStore(state => state.toggleDrawer);
    
    const {
        poInput, setPoInput,
        dialogOpen, setDialogOpen,
        loading,
        poResults,
        confirmAqlOpen,
        aqlLevel,
        isPoLoaded,
        user,
        logout,
        t,
        handleAqlChange,
        handleConfirmAqlChange,
        handleCancelAqlChange,
        handleSearchPO,
        handleSelectPO
    } = useAppbarInspection();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: { xs: 'stretch', lg: 'center' },
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                backgroundColor: (t) => t.color?.background?.o2 || '#F5F5F9',
                borderBottom: (t) => `1px solid ${t.color?.neutral?.o3 || '#D2D6DE'}`,
                gap: 2,
            }}
        >
            {/* Left: Title + Search Container */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', xl: 'row' },
                alignItems: { xs: 'stretch', xl: 'center' },
                gap: 2,
                width: '100%'
            }}>
                {/* ─── Title & Mobile User Info Row ─── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {/* Hamburger menu for mobile */}
                        <IconButton
                            onClick={toggleDrawer}
                            sx={{
                                display: { xs: 'flex', lg: 'none' },
                                color: (t: any) => t.color?.text?.o1 || '#1B2722',
                                p: 0.5,
                                mr: 0.5,
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '18px', sm: '20px' },
                                color: (t) => t.color?.text?.o1 || '#1B2722',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {t.inspection.title}
                            <Typography component="span" sx={{ fontSize: '11px', fontWeight: 700, color: '#666', backgroundColor: '#e0e0e0', px: 0.8, py: 0.2, borderRadius: 1 }}>
                                {VERSION}
                            </Typography>
                        </Typography>
                    </Box>

                    {/* Show User Info on mobile right beside the title */}
                    <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px', color: (t: any) => t.color?.text?.o1 || '#1B2722', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.account?.username}
                        </Typography>
                        <IconButton
                            onClick={() => logout()}
                            sx={{ color: (t: any) => t.color?.error?.main || '#d32f2f', p: 0.5 }}
                        >
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* ─── Action Row (AQL + Search) ─── */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: 1, 
                    alignItems: 'center', 
                    width: '100%',
                    overflowX: 'auto',
                    pb: { xs: 0.5, lg: 0 },
                    /* Hide scrollbar for cleaner look on mobile */
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}>
                    <Tooltip title={isPoLoaded ? t.inspection.aqlResetPo : t.inspection.selectAqlFirst} arrow>
                        <ToggleButtonGroup
                            value={aqlLevel}
                            exclusive
                            onChange={handleAqlChange}
                            size="small"
                            sx={{
                                backgroundColor: '#fff',
                                height: '40px',
                                display: 'flex',
                                flexWrap: 'nowrap',
                                flexShrink: 0,
                                '& .MuiToggleButton-root': {
                                    fontWeight: 600,
                                    px: { xs: 1, sm: 2 },
                                    fontSize: { xs: '12px', sm: '14px' },
                                    color: '#333',
                                    border: '1px solid #ccc',
                                    whiteSpace: 'nowrap',
                                    '&.Mui-selected': {
                                        color: '#d32f2f',
                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                        borderColor: '#d32f2f',
                                        '&:hover': {
                                            backgroundColor: 'rgba(211, 47, 47, 0.2)',
                                        }
                                    },
                                    '&.Mui-disabled': {
                                        opacity: 0.6,
                                    },
                                    '&.Mui-selected.Mui-disabled': {
                                        color: '#d32f2f',
                                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="Regular orders (AQL 1.0, Level I)">REGULAR</ToggleButton>
                            <ToggleButton value="Japan orders (AQL 1.0, Level II)">JAPAN</ToggleButton>
                            <ToggleButton value="100%inspection">100%</ToggleButton>
                        </ToggleButtonGroup>
                    </Tooltip>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1, minWidth: '280px' }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder={t.inspection.enterPo}
                            value={poInput}
                            onChange={(e) => setPoInput(e.target.value)}
                            sx={{
                                flex: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '4px',
                                    backgroundColor: (theme) => theme.color?.background?.o1 || '#fff',
                                },
                            }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: (theme) => theme.color?.neutral?.o5 || '#989FB0', mr: 1 }} />,
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearchPO();
                            }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleSearchPO}
                            disabled={loading}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '4px',
                                fontWeight: 700,
                                px: { xs: 2, sm: 3 },
                                height: '40px',
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                backgroundColor: (theme) => theme.color?.primary?.o5 || '#39B54A',
                                '&:hover': {
                                    backgroundColor: (theme) => theme.color?.primary?.o6 || '#27A338',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : t.inspection.loadPo}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Right: Desktop User Info + Logout */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 600, color: (t: any) => t.color?.text?.o1 || '#1B2722' }}>
                    {user?.account?.fullname || user?.account?.username}
                </Typography>
                <IconButton
                    onClick={() => logout()}
                    sx={{ color: (t: any) => t.color?.error?.main || '#d32f2f' }}
                    title="Logout"
                >
                    <LogoutIcon />
                </IconButton>
            </Box>

            {/* PO Selection Dialog */}
            <PoSelectionDialog
                open={dialogOpen}
                poInput={poInput}
                poResults={poResults}
                onClose={() => setDialogOpen(false)}
                onSelectPO={handleSelectPO}
            />

            <ConfirmDialog
                open={confirmAqlOpen}
                title={t.inspection.confirmAqlChangeTitle}
                content={t.inspection.confirmAqlChangeContent}
                positiveText={t.common.ok}
                negativeText={t.common.cancel}
                onPositive={handleConfirmAqlChange}
                onNegative={handleCancelAqlChange}
            />
        </Box>
    );
};
