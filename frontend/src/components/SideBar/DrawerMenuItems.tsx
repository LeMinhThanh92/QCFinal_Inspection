import { List, ListItemButton, ListItemIcon, Typography, Divider } from "@mui/material";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChecklistIcon from '@mui/icons-material/Checklist';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Theme } from "@mui/material";

interface Props {
    isDrawerOpen: boolean;
    openCollapse: any;
    toggleCollapse: () => void;
}

const MenuItemRow = ({
    path, icon, label, isActive, isDrawerOpen, onClick
}: {
    path: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isDrawerOpen: boolean;
    onClick: (e: React.MouseEvent) => void;
}) => (
    <ListItemButton
        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
        onClick={onClick}
    >
        <ListItemIcon sx={{
            minWidth: 40,
            color: (theme: Theme) => isActive ? theme.color?.primary?.o6 || '#2e7d32' : theme.color?.neutral?.o5 || '#666'
        }}>
            {icon}
        </ListItemIcon>
        {isDrawerOpen && (
            <Typography sx={{
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: (theme: Theme) => isActive ? theme.color?.primary?.o6 || '#2e7d32' : theme.color?.text?.o1 || '#333'
            }}>
                {label}
            </Typography>
        )}
    </ListItemButton>
);

export default function DrawerListMenuItem({ isDrawerOpen }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path: string) => {
        navigate(path, { replace: true });
    };

    const menuItems = [
        { key: 'inspection', label: 'QC Inspection', icon: <ChecklistIcon fontSize="small" />, path: '/' },
        { key: 'po-today', label: 'PO Inspection Today', icon: <EventNoteIcon fontSize="small" />, path: '/po-today' },
        { key: 'moisture', label: 'Moisture', icon: <WaterDropIcon fontSize="small" />, path: '/moisture' },
        { key: 'moisture-report', label: 'Moisture Report', icon: <AssessmentIcon fontSize="small" />, path: '/moisture-report' },
        { key: 'inspection-report', label: 'Inspection Report', icon: <AssessmentIcon fontSize="small" />, path: '/inspection-report' },
        { key: 'ctq-report', label: 'CTQ Report', icon: <AssessmentIcon fontSize="small" />, path: '/ctq-report' },
    ];

    return (
        <List>
            <List component="div" disablePadding>
                {menuItems.map((item) => (
                    <MenuItemRow
                        key={item.key}
                        path={item.path}
                        icon={item.icon}
                        label={item.label}
                        isActive={location.pathname === item.path || (item.path === '/' && location.pathname === '/inspection')}
                        isDrawerOpen={isDrawerOpen}
                        onClick={(e) => { e.stopPropagation(); handleNavigate(item.path); }}
                    />
                ))}
            </List>
            
            <Divider sx={{ my: 0.5, mx: 2, borderColor: (theme: Theme) => theme.color?.background?.o5 || '#e0e0e0' }} />
            
            <MenuItemRow
                path="/navigation"
                icon={<HomeIcon fontSize="small" />}
                label="Navigation"
                isActive={location.pathname === '/navigation'}
                isDrawerOpen={isDrawerOpen}
                onClick={(e) => { e.stopPropagation(); handleNavigate('/navigation'); }}
            />
        </List>
    );
}
