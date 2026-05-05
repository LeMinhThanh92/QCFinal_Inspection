import { List, ListItemButton, ListItemIcon, Typography, Divider } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BrushIcon from '@mui/icons-material/Brush';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import PrintIcon from '@mui/icons-material/Print';
import TimerOffRoundedIcon from '@mui/icons-material/TimerOffRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { useAuth } from "@/utils/context/AuthProvider";
import { checkDowntimeAccess_api } from "@/network/urls/ie_Machine";
import { useLocale } from "@/utils/context/LocaleProvider";

interface Props {
    isDrawerOpen: boolean;
    openCollapse: any;
    toggleCollapse: () => void;
}

export default function DrawerListMenuItem({ isDrawerOpen, toggleCollapse }: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const navDept = localStorage.getItem('department');
    const { user } = useAuth();
    const { t } = useLocale();
    const [hasDowntimeAccess, setHasDowntimeAccess] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (!user?.account?.username) return;
            try {
                const userCode = user.account.username;
                const res = await checkDowntimeAccess_api(userCode);
                if (res && String(res.result) === '1') {
                    setHasDowntimeAccess(true);
                }
            } catch (err) {
                console.error("Failed to check downtime access:", err);
            }
        };
        checkAccess();
    }, [user?.account?.username]);

    const handleReturnNav = () => {
        sessionStorage.setItem('fromNavAction', 'true');
        navigate('/', { replace: true });
    };

    const handleNavigateFeature = (path: string, dept: string | null = null) => {
        if (dept) {
            localStorage.setItem('department', dept);
        }
        sessionStorage.removeItem('fromNavAction');
        navigate(path, { replace: true });
    };

    const departments = [
        { key: 'HEAT TRANSFER', label: t.nav.heatTransfer, icon: <WhatshotIcon fontSize="small" />, path: '/scanOutput' },
        { key: 'EMBROIDERY', label: t.nav.embroidery, icon: <BrushIcon fontSize="small" />, path: '/embroidery' },
        { key: 'PADPRINT', label: t.nav.padPrint, icon: <PrintIcon fontSize="small" />, path: '/pad-print' },
    ];

    return (
        <List>
            <List component="div" disablePadding>
                    {departments.filter(dept => dept.key === navDept).map((dept) => (
                        <ListItemButton
                            key={dept.key}
                            sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                            onClick={(e) => { e.stopPropagation(); handleNavigateFeature(dept.path, dept.key); }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => navDept === dept.key && location.pathname === dept.path ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                {dept.icon}
                            </ListItemIcon>
                            {isDrawerOpen && (
                            <Typography sx={{
                                fontSize: 14,
                                fontWeight: navDept === dept.key && location.pathname === dept.path ? 700 : 500,
                                color: (theme: any) => navDept === dept.key && location.pathname === dept.path ? theme.color.primary.o6 : theme.color.neutral.o9
                            }}>
                                {dept.label}
                            </Typography>
                            )}
                        </ListItemButton>
                    ))}

                    {/* Heat Transfer sub-menus — only visible when HT is selected */}
                    {navDept === 'HEAT TRANSFER' && (
                        <>
                            {hasDowntimeAccess && (
                                <ListItemButton
                                    sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                    onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/logo'); }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/logo' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                        <StyleRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    {isDrawerOpen && (
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: location.pathname === '/logo' ? 700 : 500,
                                        color: (theme: any) => location.pathname === '/logo' ? theme.color.primary.o6 : theme.color.neutral.o9
                                    }}>
                                        {t.nav.logo}
                                    </Typography>
                                    )}
                                </ListItemButton>
                            )}

                            {hasDowntimeAccess && (
                                <ListItemButton
                                    sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                    onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/downtime'); }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/downtime' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                        <TimerOffRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    {isDrawerOpen && (
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: location.pathname === '/downtime' ? 700 : 500,
                                        color: (theme: any) => location.pathname === '/downtime' ? theme.color.primary.o6 : theme.color.neutral.o9
                                    }}>
                                        {t.nav.downtime}
                                    </Typography>
                                    )}
                                </ListItemButton>
                            )}

                            <Divider sx={{ my: 0.5, mx: 2, borderColor: (theme) => theme.color.background.o5 }} />

                            {hasDowntimeAccess && (
                                <ListItemButton
                                    sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                    onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/daily-report'); }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/daily-report' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                        <AssessmentRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    {isDrawerOpen && (
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: location.pathname === '/daily-report' ? 700 : 500,
                                        color: (theme: any) => location.pathname === '/daily-report' ? theme.color.primary.o6 : theme.color.neutral.o9
                                    }}>
                                        {t.nav.dailyReport}
                                    </Typography>
                                    )}
                                </ListItemButton>
                            )}

                            {hasDowntimeAccess && (
                                <ListItemButton
                                    sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                    onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/downtime-report'); }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/downtime-report' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                        <SummarizeRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    {isDrawerOpen && (
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: location.pathname === '/downtime-report' ? 700 : 500,
                                        color: (theme: any) => location.pathname === '/downtime-report' ? theme.color.primary.o6 : theme.color.neutral.o9
                                    }}>
                                        {t.nav.downtimeReport}
                                    </Typography>
                                    )}
                                </ListItemButton>
                            )}

                            {hasDowntimeAccess && (
                                <ListItemButton
                                    sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                    onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/ht-sum-output'); }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/ht-sum-output' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                        <AssessmentRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    {isDrawerOpen && (
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: location.pathname === '/ht-sum-output' ? 700 : 500,
                                        color: (theme: any) => location.pathname === '/ht-sum-output' ? theme.color.primary.o6 : theme.color.neutral.o9
                                    }}>
                                        {t.nav.htSumOutputReport}
                                    </Typography>
                                    )}
                                </ListItemButton>
                            )}

                            {hasDowntimeAccess && (
                                <ListItemButton
                                    sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                    onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/edit-output'); }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/edit-output' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                        <EditNoteRoundedIcon fontSize="small" />
                                    </ListItemIcon>
                                    {isDrawerOpen && (
                                    <Typography sx={{
                                        fontSize: 14,
                                        fontWeight: location.pathname === '/edit-output' ? 700 : 500,
                                        color: (theme: any) => location.pathname === '/edit-output' ? theme.color.primary.o6 : theme.color.neutral.o9
                                    }}>
                                        {t.nav.editOutput}
                                    </Typography>
                                    )}
                                </ListItemButton>
                            )}
                        </>
                    )}

                    {/* Pad Print sub-menus */}
                    {navDept === 'PADPRINT' && (
                        <>
                            <Divider sx={{ my: 0.5, mx: 2, borderColor: (theme) => theme.color.background.o5 }} />
                            {hasDowntimeAccess && (
                                <>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/downtime'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/downtime' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <TimerOffRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/downtime' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/downtime' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.downtime}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/padprint-daily-report'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/padprint-daily-report' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <AssessmentRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/padprint-daily-report' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/padprint-daily-report' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.dailyReport}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/downtime-report'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/downtime-report' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <SummarizeRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/downtime-report' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/downtime-report' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.downtimeReport}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/ht-sum-output'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/ht-sum-output' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <AssessmentRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/ht-sum-output' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/ht-sum-output' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.htSumOutputReport}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/edit-output'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/edit-output' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <EditNoteRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/edit-output' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/edit-output' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.editOutput}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                </>
                            )}
                        </>
                    )}

                    {/* Embroidery sub-menus */}
                    {navDept === 'EMBROIDERY' && (
                        <>
                            <Divider sx={{ my: 0.5, mx: 2, borderColor: (theme) => theme.color.background.o5 }} />
                            {hasDowntimeAccess && (
                                <>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/downtime'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/downtime' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <TimerOffRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/downtime' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/downtime' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.downtime}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/embroidery-daily-report'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/embroidery-daily-report' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <AssessmentRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/embroidery-daily-report' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/embroidery-daily-report' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.dailyReport}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/downtime-report'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/downtime-report' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <SummarizeRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/downtime-report' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/downtime-report' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.downtimeReport}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/ht-sum-output'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/ht-sum-output' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <AssessmentRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/ht-sum-output' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/ht-sum-output' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.htSumOutputReport}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                    <ListItemButton
                                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                                        onClick={(e) => { e.stopPropagation(); handleNavigateFeature('/edit-output'); }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => location.pathname === '/edit-output' ? theme.color.primary.o6 : theme.color.neutral.o5 }}>
                                            <EditNoteRoundedIcon fontSize="small" />
                                        </ListItemIcon>
                                        {isDrawerOpen && (
                                        <Typography sx={{
                                            fontSize: 14,
                                            fontWeight: location.pathname === '/edit-output' ? 700 : 500,
                                            color: (theme: any) => location.pathname === '/edit-output' ? theme.color.primary.o6 : theme.color.neutral.o9
                                        }}>
                                            {t.nav.editOutput}
                                        </Typography>
                                        )}
                                    </ListItemButton>
                                </>
                            )}
                        </>
                    )}

                    <Divider sx={{ my: 0.5, mx: 2, borderColor: (theme) => theme.color.background.o5 }} />

                    <ListItemButton
                        sx={{ pl: 2, minHeight: '48px', position: 'relative' }}
                        onClick={(e) => { e.stopPropagation(); handleReturnNav(); }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: (theme: any) => theme.color.primary.o6 }}>
                            <KeyboardReturnIcon fontSize="small" />
                        </ListItemIcon>
                        {isDrawerOpen && (
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: (theme: any) => theme.color.neutral.o8 }}>
                            {t.nav.home}
                        </Typography>
                        )}
                    </ListItemButton>
                </List>
        </List>
    );
}
