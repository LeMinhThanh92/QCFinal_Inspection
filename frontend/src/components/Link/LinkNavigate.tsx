import {styled} from "@mui/system";
import {Link} from "react-router-dom";

export const LinkNavigate = styled(Link)(({theme}) => ({
    textDecoration: 'none',
    color: theme.palette.text.primary,
    zIndex: 999
}));