import { Box, Typography } from '@mui/material';

export const PageComingSoon = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
            <Typography variant="h3" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                Coming Soon
            </Typography>
            <Typography variant="h6" color="textSecondary">
                Tính năng này đang trong quá trình phát triển (Under Construction).
            </Typography>
        </Box>
    );
};
