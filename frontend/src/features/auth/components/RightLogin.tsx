import React, { useCallback, useRef, useState } from "react";
import { BaseTextFieldProps, Button, IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { toast } from "@/utils/states/state.ts";
import { ScreenLoaderBackdrop } from "@components/Loading/ScreenLoaderBackdrop.tsx";
import { useLocale } from "@/utils/context/LocaleProvider";
import { TextFieldMandatory } from "@/components/Field/TextFieldMandatory";
import DialogFullScreen from "@components/Dialog/DialogFullScreen";
import Html5QrcodePlugin from "@/features/dashboard/components/Html5QrcodePlugin";

interface RightLoginProps {
    login: (credentials: { username: string; password: string }) => Promise<void>;
    onSuccess: () => void;
}

interface PasswordFieldProps extends BaseTextFieldProps {
    passwordRef: React.MutableRefObject<HTMLInputElement | undefined>;
    error?: boolean;
    helperText?: string;
    onEnter: () => void;
    onScanClick: () => void;
}

const PasswordField = (props: PasswordFieldProps) => {
    const { t } = useLocale();
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordVisibilityToggle = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            props.onEnter();
        }
    };

    return (
        <TextFieldMandatory
            required
            label={t.auth.password}
            name="password"
            type={showPassword ? 'text' : 'password'}
            inputRef={props.passwordRef}
            error={props.error}
            helperText={props.helperText}
            onFocus={props.onFocus}
            onKeyDown={handleKeyDown}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={props.onScanClick}
                            edge="end"
                            sx={{
                                color: '#2e7d32',
                                '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)' },
                            }}
                            title={t.auth.scanBarcode}
                        >
                            <QrCodeScannerIcon />
                        </IconButton>
                        <IconButton onClick={handlePasswordVisibilityToggle} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export const RightLogin = ({ login, onSuccess }: RightLoginProps) => {
    const { t } = useLocale();
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<{ username?: string; password?: string }>({});
    const usernameRef = useRef<HTMLInputElement | undefined>(undefined);
    const passwordRef = useRef<HTMLInputElement | undefined>(undefined);
    const [scanOpen, setScanOpen] = useState(false);

    const handleScanSuccess = useCallback((decodedText: string) => {
        const value = String(decodedText || '').trim();
        if (!value) return;

        if (passwordRef.current) {
            // Use native setter to trigger React's change detection
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
            )?.set;
            nativeInputValueSetter?.call(passwordRef.current, value);
            passwordRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setScanOpen(false);
        setError((prev) => ({ ...prev, password: '' }));
    }, []);

    const handleSubmit = async () => {
        if (!validateFields()) return;
        try {
            setIsPending(true);
            const username = usernameRef.current?.value ?? '';
            await login({ username, password: passwordRef.current?.value ?? '' });
            localStorage.setItem('rememberedUsername', username);
            onSuccess()
        } catch (error: any) {
            toast.value = {
                ...toast.value,
                message: error
            };
        } finally {
            setIsPending(false);
        }
    };

    const validateFields = (): boolean => {
        const username = usernameRef.current?.value ?? '';
        const password = passwordRef.current?.value ?? '';
        let isValid = true;

        if (!username) {
            setError((prev) => ({ ...prev, username: t.auth.requireUser }));
            isValid = false;
        } else {
            setError((prev) => ({ ...prev, username: '' }));
        }

        if (!password) {
            setError((prev) => ({ ...prev, password: t.auth.requirePass }));
            isValid = false;
        } else {
            setError((prev) => ({ ...prev, password: '' }));
        }

        return isValid;
    };

    return <Stack spacing={3} width={'344px'}>
        <ScreenLoaderBackdrop open={isPending} />
        <Typography sx={{ fontWeight: 600, fontSize: 46, color: (theme) => theme.color.text.o1 }}>
            {t.auth.login}
        </Typography>
        <TextFieldMandatory
            required
            name="username"
            label={t.auth.username}
            inputRef={usernameRef}
            defaultValue={localStorage.getItem('rememberedUsername') || ''}
            placeholder={t.auth.enterUsername}
            fullWidth
            error={!!error.username}
            helperText={error.username}
            onFocus={() => {
                setError((prev) => ({ ...prev, username: '' }))
            }}
        />
        <PasswordField
            passwordRef={passwordRef}
            error={!!error.password}
            helperText={error.password}
            onFocus={() => {
                setError((prev) => ({ ...prev, password: '' }))
            }}
            onEnter={handleSubmit}
            onScanClick={() => setScanOpen(true)}
        />
        <Button
            sx={{ color: (theme) => theme.color.neutral.o1, height: '48px' }}
            variant="contained"
            onClick={handleSubmit}
        >
            {t.auth.login}
        </Button>

        {/* Barcode Scanner Dialog — same component as dashboard */}
        <DialogFullScreen
            title={t.auth.scanBarcode}
            open={scanOpen}
            onTransitionExited={() => setScanOpen(false)}
            dialogAction={{
                handleClose: () => setScanOpen(false),
                handleSubmit: () => { },
                disablePositiveButton: true,
                positiveTextButton: t.common.ok,
                negativeTextButton: t.common.close,
            }}
        >
            {scanOpen && (
                <Html5QrcodePlugin
                    qrCodeSuccessCallback={handleScanSuccess}
                    fps={10}
                    qrbox={250}
                    disableFlip={false}
                    skipValidation={true}
                    enableQrCode={true}
                />
            )}
        </DialogFullScreen>
    </Stack>
}