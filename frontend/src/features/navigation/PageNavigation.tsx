import { Box, Button, Grid, Typography, useMediaQuery, Theme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { LeftLogin } from "@/features/auth/components/LeftLogin.tsx";
import { useAuth } from "@/utils/context/AuthProvider.tsx";
import { useLocale } from "@/utils/context/LocaleProvider";

const SvgSampleRoom = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Room/Building icon */}
        <rect x="15" y="25" width="70" height="55" rx="4" fill="#f4f6f7" stroke="#2c3e50" strokeWidth="3" />
        <rect x="15" y="20" width="70" height="12" rx="3" fill="#34495e" stroke="#2c3e50" strokeWidth="2" />
        {/* Door */}
        <rect x="40" y="45" width="20" height="35" rx="2" fill="#ecf0f1" stroke="#2c3e50" strokeWidth="2" />
        <circle cx="55" cy="63" r="2" fill="#e67e22" />
        {/* Window */}
        <rect x="22" y="40" width="12" height="12" rx="1" fill="#3498db" stroke="#2c3e50" strokeWidth="1.5" opacity="0.7" />
        <rect x="66" y="40" width="12" height="12" rx="1" fill="#3498db" stroke="#2c3e50" strokeWidth="1.5" opacity="0.7" />
        {/* Hanger/Cloth */}
        <line x1="25" y1="58" x2="25" y2="70" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="62" x2="28" y2="62" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="58" x2="72" y2="70" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
        <line x1="69" y1="62" x2="75" y2="62" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
        <text x="50" y="110" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#2c3e50" textAnchor="middle">SAMPLE ROOM</text>
    </svg>
);

const SvgInspection = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <rect x="20" y="25" width="60" height="70" rx="4" fill="#f4f6f7" stroke="#2c3e50" strokeWidth="3" />
        <line x1="30" y1="40" x2="70" y2="40" stroke="#3498db" strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="55" x2="70" y2="55" stroke="#ecf0f1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="35" cy="55" r="3" fill="#27ae60" />
        <line x1="30" y1="70" x2="70" y2="70" stroke="#ecf0f1" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="68" x2="38" y2="72" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="68" x2="32" y2="72" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
        <path d="M 60 75 L 85 100 L 90 95 L 65 70 Z" fill="#95a5a6" stroke="#2c3e50" strokeWidth="2" />
        <circle cx="55" cy="65" r="15" fill="none" stroke="#2c3e50" strokeWidth="3" />
        <circle cx="55" cy="65" r="10" fill="#3498db" opacity="0.3" />
        <text x="50" y="115" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#2c3e50" textAnchor="middle">INSPECTION CTQ</text>
    </svg>
);

export const PageNavigation = () => {
    const navigate = useNavigate();
    const { t } = useLocale();
    const { logout } = useAuth();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    const menuItems = [
        { path: "/inspection", dept: "INSPECTION", icon: <SvgInspection /> },
    ];

    const handleSelectDepartment = (item: any) => {
        localStorage.setItem('department', item.dept);
        sessionStorage.removeItem('fromNavAction');
        navigate(item.path);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <Grid container height="100vh" sx={{ backgroundColor: '#f8f9fc', overflow: 'hidden' }}>
            {!isMobile && (
                <Grid item xs={12} md={4}>
                    <LeftLogin />
                </Grid>
            )}
            <Grid
                item
                xs={12}
                md={isMobile ? 12 : 8}
                sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
            >
                {/* Header Actions */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: 'center',
                        p: 3,
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100%'
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LogoutIcon sx={{ transform: 'rotate(180deg)' }} />}
                        onClick={handleLogout}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600
                        }}
                    >
                        {t.auth.logout}
                    </Button>
                </Box>

                {/* Main Content */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        p: 4
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: '#1a2b4c', mb: 6 }}
                    >
                        {t.nav.selectFeature}
                    </Typography>

                    <Grid container spacing={3} justifyContent="center" maxWidth="sm">
                        {menuItems.map((item, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Box
                                    onClick={() => handleSelectDepartment(item)}
                                    sx={{
                                        height: 220,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 4,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: '1px solid transparent',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 130,
                                            height: 156,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Grid>
        </Grid>
    );
};
