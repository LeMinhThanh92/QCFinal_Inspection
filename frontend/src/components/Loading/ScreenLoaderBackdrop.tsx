import {Backdrop, CircularProgress} from "@mui/material";

interface ScreenLoaderBackdropProps {
    open: boolean
}

export const ScreenLoaderBackdrop = ({open}: ScreenLoaderBackdropProps) => {
    return <Backdrop
        open={open}
        sx={{
            zIndex: (theme) => theme.zIndex.drawer + 999,
            color: (theme) => theme.palette.primary.main
        }}>
        <CircularProgress color="inherit"/>
    </Backdrop>
}