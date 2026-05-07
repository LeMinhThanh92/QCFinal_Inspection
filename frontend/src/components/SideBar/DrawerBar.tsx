import {
    Box, CSSObject, Divider, IconButton, styled, Theme, Typography, useMediaQuery, useTheme
} from "@mui/material";
import MuiDrawer from '@mui/material/Drawer';
import { MenuOpen, MenuOutlined } from "@mui/icons-material";
import DrawerListMenuItem from "@/components/SideBar/DrawerMenuItems";
import React, { memo } from "react";
import { VERSION } from "@/components/constants/version";
import { useAppStore } from "@/utils/states/useAppStore";
import { AppbarInspection } from "@/features/inspection/components/AppbarInspection";

const drawerWidth = 220;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    borderColor: theme.color?.background?.o5 || '#e0e0e0',
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    borderColor: theme.color?.background?.o5 || '#e0e0e0',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('lg')]: {
        width: 60,
    },
    [theme.breakpoints.down('lg')]: {
        width: 0,
        border: 'none',
    },
});

const DrawerHeader = styled('div')<{ isOpen: boolean }>(({ theme, isOpen }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'space-between' : 'center',
    padding: theme.spacing(0, 1),
    minHeight: '64px',
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const MemoizedDrawer = memo(({ isOpen, toggle, isMobile }: { isOpen: boolean; toggle: () => void; isMobile: boolean }) => {
    return (
        <Drawer variant={isMobile ? (isOpen ? "temporary" : "permanent") : "permanent"} open={isOpen} onClose={toggle}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DrawerHeader isOpen={isOpen}>
                    {isOpen && (
                        <Typography sx={{ ml: 1, fontWeight: 800, color: (t: any) => t.color?.primary?.main || '#2e7d32' }}>
                            TRAX QC
                        </Typography>
                    )}
                    <IconButton onClick={toggle}>
                        {isOpen ? <MenuOpen color='primary' /> : <MenuOutlined color='primary' />}
                    </IconButton>
                </DrawerHeader>
                <Divider sx={{ borderColor: (theme: any) => theme.color?.background?.o5 || '#e0e0e0' }} />
                
                <Box sx={{ flexGrow: 1 }}>
                    <DrawerListMenuItem
                        isDrawerOpen={isOpen}
                        openCollapse={false}
                        toggleCollapse={() => {}}
                    />
                </Box>
                
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    {isOpen && (
                        <Typography sx={{ fontWeight: 'bold', fontSize: '11px', color: '#666' }}>
                            {VERSION}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Drawer>
    )
});

export default function DrawerBar({ children }: { children: React.ReactNode }) {
    const isDrawerOpen = useAppStore(state => state.isDrawerOpen);
    const toggleDrawer = useAppStore(state => state.toggleDrawer);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
            <MemoizedDrawer isOpen={isDrawerOpen} toggle={toggleDrawer} isMobile={isMobile} />
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <AppbarInspection />
                <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
