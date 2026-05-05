import { TextFieldMandatory } from "@/components/Field/TextFieldMandatory";
import { useApiSend } from "@/hooks/app/useApiSend";
import { useFormChangePassword } from "@/hooks/feature_changePassword/useFormChangePassword";
import { changePassword } from "@/network/urls/auth";
import { toast } from "@/utils/states/state";
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, Stack, Typography } from "@mui/material"
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { ScreenLoaderBackdrop } from "@/components/Loading/ScreenLoaderBackdrop";
import { useLocale } from "@/utils/context/LocaleProvider";
import { useAuth } from "@/utils/context/AuthProvider";

interface FormChangePasswordProps {
    handleOnCloseDialog: () => void;
}

export const FormChangePassword: React.FC<FormChangePasswordProps> = ({ handleOnCloseDialog }) => {
    const { t } = useLocale();
    const [showPassword, setShowPassword] = useState<any>({
        current_password: false,
        new_password: false,
        confirm_password: false,
    });
    const { logout } = useAuth();
    const { formChangePassword, errors, handleChangeField, setFormChangePassword, isFormValid } = useFormChangePassword();
    const { mutate, isPending } = useApiSend(changePassword,
        () => {
            toast.value = {
                ...toast.value,
                message: t.auth.changePasswordSuccess,
                type: 'success',
            };
            setFormChangePassword({
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
            handleOnCloseDialog();
            logout();
        }, error => {
            toast.value = {
                ...toast.value,
                message: error?.toString() ?? 'Error',
                type: 'error',
            }
        }, [['changePassword']])

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        mutate(formChangePassword);
    };

    const handlePasswordVisibilityToggle = useCallback((field: string) => {
        setShowPassword((prev: any) => ({
            ...prev,
            [field]: !prev[field],
        }));
    }, []);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mx: 'auto', width: '100%', padding: 2, backgroundColor: (theme) => theme.color.background.o2, borderRadius: '8px' }}>
            <ScreenLoaderBackdrop open={isPending}/>
            <Stack direction={'row'}>
                <Grid container>
                    <Grid item xs={12} md={12}>
                        <FormControl fullWidth margin="normal">
                            <TextFieldMandatory
                                error={!!errors?.current_password}
                                helperText={errors?.current_password}
                                label= {t.auth.currentPassword}
                                name="current_password"
                                type={showPassword.current_password ? 'text' : 'password'}
                                value={formChangePassword.current_password}
                                onChange={handleChangeField}
                                placeholder={t.auth.currentPassword}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={()=>handlePasswordVisibilityToggle('current_password')} edge="end">
                                                {showPassword.current_password ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FormControl fullWidth margin="normal">
                            <TextFieldMandatory
                                error={!!errors?.new_password}
                                helperText={errors?.new_password}
                                label={t.auth.newPassword}
                                name="new_password"
                                type={showPassword.new_password ? 'text' : 'password'}
                                value={formChangePassword.new_password}
                                onChange={handleChangeField}
                                placeholder={t.auth.newPassword}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={()=>handlePasswordVisibilityToggle('new_password')} edge="end">
                                                {showPassword.new_password ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FormControl fullWidth margin="normal">
                            <TextFieldMandatory
                                error={!!errors?.confirm_password}
                                helperText={errors?.confirm_password}
                                label={t.auth.confirmPassword}
                                name="confirm_password"
                                type={showPassword.confirm_password ? 'text' : 'password'}
                                value={formChangePassword.confirm_password}
                                onChange={handleChangeField}
                                placeholder={t.auth.confirmPassword}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={()=>handlePasswordVisibilityToggle('confirm_password')} edge="end">
                                                {showPassword.confirm_password ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={12} mt={2}>
                        <Button disabled={!isFormValid} variant="contained" color="primary" type="submit" fullWidth>
                           {t.auth.changePassword}
                        </Button>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    )
}