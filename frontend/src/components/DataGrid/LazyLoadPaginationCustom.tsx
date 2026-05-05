import { useLocale } from "@/utils/context/LocaleProvider";
import { Box, Typography } from "@mui/material";

type LazyLoadPaginationCustomProps = {
    rowCount?: number;
    totalCurrentRow?: number
};

export function LazyLoadPaginationCustom({ rowCount, totalCurrentRow }: LazyLoadPaginationCustomProps) {
    const { t } = useLocale();
    return (
        <Box
            sx={{
                display: "flex",
                width: "100%",
                justifyContent: "flex-end",
                alignItems: "center",
                px: 0,
                py: 2, 
            }}
        >
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: (theme)=>theme.color.text.o1}}>
                {t.common.allTotal}: 
                {totalCurrentRow ===0 ? " -/-" : 
                (
                    <strong>{totalCurrentRow ?? 0}/{rowCount ?? 0}</strong>
                )}
            </Typography>
        </Box>
    );
}