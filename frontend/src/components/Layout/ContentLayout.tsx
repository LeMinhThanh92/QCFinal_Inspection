import { Box } from "@mui/material";

type ContentLayoutProps = {
    children: React.ReactNode;
    title?: string;
};

export const ContentLayout = ({children}: ContentLayoutProps) => {
    return (
        <Box
            mt={1}
            mb={1}
            sx={{
                height: '100%',
                width: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {children}
        </Box>
    );
};
