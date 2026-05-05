import { Avatar, Box, FormControl, Grid, MenuItem, Select, SelectChangeEvent, Theme, Typography, useMediaQuery, Stack } from "@mui/material";
import { LeftLogin } from "@/features/auth/components/LeftLogin.tsx";
import { RightLogin } from "@/features/auth/components/RightLogin.tsx";
import { useAuth } from "@/utils/context/AuthProvider.tsx";
import { useNavigate } from "react-router-dom";
import { useLocale, Lang } from "@/utils/context/LocaleProvider";
import { LANGUAGES } from "@/components/constants/language";

export function PageLogin() {
    const { login } = useAuth();
    const { lang, setLang } = useLocale();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const navigation = useNavigate()
    const handleChange = (event: SelectChangeEvent<string>) => {
        setLang(event.target.value as Lang);
    };
    return (
        <Grid container height="100vh" sx={{ overflow: 'hidden' }}>
            {!isMobile && (
                <Grid item xs={12} md={7}>
                    <LeftLogin />
                </Grid>
            )}
            <Grid
                item
                xs={12}
                md={isMobile ? 12 : 5}
                p={3}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <FormControl>
                        <Select
                            labelId="demo-select-small-label"
                            id="demo-select-small"
                            size="small"
                            sx={{ width: "100px" }}
                            value={lang}
                            onChange={handleChange}
                        >
                            {LANGUAGES.map(({ language, text, imgUrl }: any, index) => (
                                <MenuItem key={index} value={language} sx={{ textAlign: "center" }}>
                                    <Stack direction="row" spacing="7px" justifyContent="center" alignItems="center">
                                        <Avatar
                                            variant="square"
                                            alt="logo"
                                            src={imgUrl}
                                            sx={{ borderRadius: "50%", width: "20px", height: "20px" }}
                                        />
                                        <Typography>{text}</Typography>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/*<FormGroup>*/}
                    {/*    <FormControlLabel*/}
                    {/*        control={*/}
                    {/*            <MaterialUISwitch*/}
                    {/*                sx={{ ml: 3 }}*/}
                    {/*                checked={mode === 'dark'}*/}
                    {/*                onChange={toggleMode}*/}
                    {/*            />*/}
                    {/*        }*/}
                    {/*        label=""*/}
                    {/*    />*/}
                    {/*</FormGroup>*/}
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                    }}
                >
                    <RightLogin login={login} onSuccess={() => navigation("/")} />
                </Box>
            </Grid>
        </Grid>
    )
}