import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import { FactCheckRounded, SpeedRounded, StyleRounded } from '@mui/icons-material';

interface SummaryCardsProps {
    reportData: any[];
}

/**
 * Floating summary cards shared between PadPrint, Embroidery, and HeatTransfer pages.
 * Computes: Total Output, Avg Efficiency, Total Bundle from report data.
 */
export const SummaryCards: React.FC<SummaryCardsProps> = ({ reportData }) => {
    const stats = useMemo(() => {
        let totalOutput = 0;
        let totalEff = 0;
        let validEffCount = 0;
        const uniqueBundles = new Set<string>();

        reportData.forEach(row => {
            const out = Number(row.Output);
            if (!isNaN(out)) totalOutput += out;

            const eff = Number(row.Effeciency);
            if (!isNaN(eff) && eff > 0) {
                totalEff += eff;
                validEffCount++;
            }

            if (row.JOB_NO && row.BUNDLE) {
                uniqueBundles.add(`${row.JOB_NO}_${row.BUNDLE}`);
            }
        });

        const avgEfficiency = validEffCount > 0 ? (totalEff / validEffCount).toFixed(2) : 0;
        return { totalOutput, avgEfficiency, totalBundle: uniqueBundles.size };
    }, [reportData]);

    const cardSx = {
        pointerEvents: 'auto' as const,
        minWidth: 200,
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
    };

    const items = [
        { label: 'TOTAL OUTPUT', value: stats.totalOutput, color: '#1b5e20', bgColor: '#e8f5e9', Icon: FactCheckRounded, iconColor: '#2e7d32' },
        { label: 'EFFICIENCY (AVG)', value: `${stats.avgEfficiency}%`, color: '#01579b', bgColor: '#e3f2fd', Icon: SpeedRounded, iconColor: '#0288d1' },
        { label: 'TOTAL BUNDLE', value: stats.totalBundle, color: '#e65100', bgColor: '#fff3e0', Icon: StyleRounded, iconColor: '#ef6c00' },
    ];

    return (
        <Stack direction="row" spacing={2} sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 10,
            pointerEvents: 'none',
        }}>
            {items.map(({ label, value, color, bgColor, Icon, iconColor }) => (
                <Card key={label} elevation={6} sx={cardSx}>
                    <CardContent sx={{ py: '16px !important' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: bgColor, display: 'flex' }}>
                                <Icon sx={{ color: iconColor, fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                                    {label}
                                </Typography>
                                <Typography variant="h4" color={color} fontWeight="900">
                                    {value}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};
