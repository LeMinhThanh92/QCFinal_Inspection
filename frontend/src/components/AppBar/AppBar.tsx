import { styled } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    background: theme.color.background.o1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    ...(open
        ? {
            marginLeft: 252,
            width: `calc(100% - ${252}px)`,
        }
        : {
            marginLeft: 72,
            width: `calc(100% - ${72}px)`,
        }),
    // mobile
    [theme.breakpoints.down('lg')]: {
        marginLeft: 0,
        width: '100%',
    },
}));
