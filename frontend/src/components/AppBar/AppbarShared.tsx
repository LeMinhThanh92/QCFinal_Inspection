import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppStore } from '@/utils/states/useAppStore';
import { useAuth } from '@/utils/context/AuthProvider';
import { VERSION } from '@/components/constants/version';
import { useLocale } from '@/utils/context/LocaleProvider';

/**
 * Lightweight shared AppBar for pages that don't need PO search or AQL toggle
 * (e.g., Report pages). Shows only: hamburger (mobile), app title, user info, and logout.
 * 
 * Compared to AppbarInspection (~160px on mobile with 3 rows),
 * this component is a single row (~56px) to maximize content area.
 */
export const AppbarShared: React.FC = () => {
    const toggleDrawer = useAppStore(state => state.toggleDrawer);
    const { user, logout } = useAuth();
    const { t } = useLocale();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                backgroundColor: (theme) => theme.color?.background?.o2 || '#F5F5F9',
                borderBottom: (theme) => `1px solid ${theme.color?.neutral?.o3 || '#D2D6DE'}`,
                minHeight: '56px',
            }}
        >
            {/* Left: Hamburger (mobile) + App Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* Hamburger menu — visible only on mobile (below lg breakpoint) */}
                <IconButton
                    onClick={toggleDrawer}
                    sx={{
                        display: { xs: 'flex', lg: 'none' },
                        color: (theme: any) => theme.color?.text?.o1 || '#1B2722',
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
                        color: (theme) => theme.color?.text?.o1 || '#1B2722',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    {t.inspection.title}
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#666',
                            backgroundColor: '#e0e0e0',
                            px: 0.8,
                            py: 0.2,
                            borderRadius: 1,
                        }}
                    >
                        {VERSION}
                    </Typography>
                </Typography>
            </Box>

            {/* Right: User Info + Logout */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: '13px', lg: '14px' },
                        color: (theme: any) => theme.color?.text?.o1 || '#1B2722',
                        maxWidth: { xs: 120, lg: 'none' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {user?.account?.fullname || user?.account?.username}
                </Typography>
                <IconButton
                    onClick={() => logout()}
                    sx={{ color: (theme: any) => theme.color?.error?.main || '#d32f2f', p: 0.5 }}
                    title={t.auth.logout}
                >
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
};
