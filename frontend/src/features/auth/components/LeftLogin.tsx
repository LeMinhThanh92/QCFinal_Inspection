import { Box, Typography } from "@mui/material";
import { VERSION } from "@/components/constants/version";

export function LeftLogin() {
    const OFFICE_LINK_IMG = '/static/images/avatars/office.jfif';
    const COPYRIGHT_TEXT = 'Copyright © Trax Group. All rights reserved';
    const SLOGAN = 'Leading\nGARMENT TECHNOLOGIST\nin SPORTSWEAR';
    const LOGO_LINK_IMG = '/static/images/avatars/logo.png';
    const APP = 'SAMPLE ROOM DIGITAL';
    return (
        <Box
            sx={{
                backgroundImage: `url("${OFFICE_LINK_IMG}")`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                position: 'relative',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <circle cx="50%" cy="50%" r="12%" fill="#F5FE91" />
            </svg>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <circle cx="87%" cy="86%" r="20%" fill="#DB91FE" />
            </svg>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <circle cx="93%" cy="10%" r="10%" fill="#91CAFE" />
            </svg>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <circle cx="10%" cy="88%" r="12%" fill="#FE9191" />
            </svg>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <circle cx="6%" cy="8%" r="10%" fill="#FE9191" />
            </svg>
            <Box
                sx={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.70)',
                    backdropFilter: 'blur(125px)',
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: 'center',
                    flexDirection: 'column',
                }}
            >
                <img
                    style={{
                        width: '25%',
                        height: '25%',
                        objectFit: 'contain',
                        marginBottom: '7%',
                        marginTop: '15%',
                    }}
                    src={LOGO_LINK_IMG}
                />
                <Box display={'flex'} flex={1} flexDirection={'column'} gap={0.5} alignItems={'center'}>
                    <Typography
                        sx={{ fontSize: 36, fontWeight: 700, lineHeight: '44px' }}
                        variant={'h5'}
                        color={'white'}
                        whiteSpace={'pre-wrap'}
                        textAlign={'center'}>
                        {SLOGAN}
                    </Typography>
                </Box>
                <Box display={'flex'} flex={1} flexDirection={'column'} gap={0.5} alignItems={'center'}>
                    <Typography
                        sx={{ fontSize: 36, fontWeight: 700 }}
                        variant={'h5'}
                        color={'white'}
                        whiteSpace={'pre-wrap'}
                        textAlign={'center'}>
                        {APP}
                    </Typography>
                    <Typography
                        sx={{ fontSize: 14, fontWeight: 400, opacity: 0.7 }}
                        color={'white'}>
                        {VERSION}
                    </Typography>
                </Box>
                <Typography m={2} sx={{ color: (theme: any) => theme.color.neutral.o5 }}>
                    {COPYRIGHT_TEXT}
                </Typography>
            </Box>
        </Box>
    );
}