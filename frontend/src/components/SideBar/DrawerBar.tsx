import {
    Avatar,
    Box,
    CSSObject,
    Divider,
    FormControl,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    styled,
    Theme,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import MuiDrawer from '@mui/material/Drawer';
import { LogoutOutlined, MenuOpen, MenuOutlined } from "@mui/icons-material";
import AppsIcon from "@mui/icons-material/Apps";
import { ContentLayout } from "@components/Layout/ContentLayout";
import DrawerListMenuItem from "@components/SideBar/DrawerMenuItems";
import { AppBar } from "@components/AppBar/AppBar";
import React, { memo, useCallback, useState, useEffect, useRef } from "react";
import { getDecorationMachines_api, getPadPrintMachines_api, getEmbroideryMachines_api, getServerTime_api, getMachineShift_api, checkActiveShift_api, checkActiveShiftPadPrint_api, checkActiveShiftEmbroidery_api } from "@/network/urls/ie_Machine.ts";

import { useAuth } from "@/utils/context/AuthProvider.tsx";
import { useLoading } from "@/utils/context/LoadingProvider.tsx";
import { useAppStore } from "@/utils/states/useAppStore.ts";
import { useLocale, Lang } from "@/utils/context/LocaleProvider.tsx";
import { useThemeContext } from "@/utils/context/ThemeContextProvider";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { VERSION } from "../constants/version";
import useFullScreen from "@/hooks/feature_shared/useFullScreen";
import { LANGUAGES } from "../constants/language";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import LogoKadex from "@/assets/logo_kadex.svg?react";
import { useDepartment } from "@/utils/context/DepartmentProvider";

interface DrawerSideBarProps {
    isOpen: boolean;
    toggle: () => void;
    children: React.ReactNode;
}

interface DrawerHeaderProps {
    isOpen: boolean;
}

const drawerWidth = 252;


const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    borderColor: theme.color.background.o5,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    borderColor: theme.color.background.o5,
    width: `calc(${theme.spacing(9)} + 1px)`,
    [theme.breakpoints.up('lg')]: {
        width: 72,
    },
    [theme.breakpoints.down('lg')]: {
        width: 0,
    },
});

const DrawerHeader = styled('div')<DrawerHeaderProps>(({ theme, isOpen }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isOpen ? 'space-between' : 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));


const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);






const AppbarSuffix = memo(() => {
    const { lang, setLang } = useLocale();
    const { user } = useAuth();
    const { handleSelectFactory, factory, userFactory, selectedFactoryDisplay, userCode } = useDepartment();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { isFullScreen, toggleFullScreen } = useFullScreen();
    const handleChange = (event: SelectChangeEvent<string>) => {
        setLang(event.target.value as Lang);
    };
    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);
    const navigate = useNavigate();
    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const { logout } = useAuth();
    const { setLoading } = useLoading();
    const [activeDept, setActiveDept] = useState<string>(localStorage.getItem('department') || 'HEAT TRANSFER');

    const {
        machinesList, setMachinesList, lastMachineFetchKey,
        selectedMachine, setSelectedMachine,
        shiftData, setShiftData, lastShiftMachine,
        serverTimeOffset, setServerTimeOffset, hasFetchedTime,
        shiftType, setShiftType,
        serverDate, setServerDate
    } = useAppStore();

    // Machine list loads based on userFactory (login factory) — NOT the selected factory.
    // Changing Factory dropdown only updates ou_code for barcode scanning.
    useEffect(() => {
        const currentUser = user?.account?.username || '';
        const fetchKey = `${userFactory}_${activeDept}_${currentUser}`;

        // Skip fetching if we already fetched for this exact combination
        if (lastMachineFetchKey === fetchKey && machinesList.length > 0) {
            return;
        }

        const fetchMachines = async () => {
            if (!userFactory || !activeDept || !user?.account?.username) return;
            try {
                // Map frontend internal codes to Stored Procedure expected strings
                let mappedFactory = userFactory;
                if (userFactory === 'F1') mappedFactory = 'Factory 1';
                else if (userFactory === 'F2') mappedFactory = 'Factory 2';
                else if (userFactory === 'F3') mappedFactory = 'Factory 3';
                else if (userFactory === 'TS') mappedFactory = 'TANS';

                let mappedDept = activeDept;
                if (activeDept === 'HEAT TRANSFER') mappedDept = 'Heat Transfer';
                else if (activeDept === 'EMBROIDERY') mappedDept = 'Embroidery';

                let res: any;
                if (activeDept === 'PADPRINT') {
                    // Pad Print uses action=15 with only factory + userCode
                    res = await getPadPrintMachines_api(mappedFactory, user.account.username);
                } else if (activeDept === 'EMBROIDERY') {
                    // Embroidery uses action=18 with only factory + userCode
                    res = await getEmbroideryMachines_api(mappedFactory, user.account.username);
                } else {
                    res = await getDecorationMachines_api(mappedFactory, mappedDept, user.account.username);
                }
                console.log('Machine API response:', res);
                const list = res?.machines || [];
                setMachinesList(list, fetchKey);

                if (res?.defaultMachine && res.defaultMachine.McID) {
                    setSelectedMachine(res.defaultMachine.McID);
                    localStorage.setItem('machine', res.defaultMachine.McID);
                } else if (list.length > 0 && list[0].McID) {
                    setSelectedMachine(list[0].McID);
                    localStorage.setItem('machine', list[0].McID);
                } else {
                    setSelectedMachine('');
                    localStorage.removeItem('machine');
                }
            } catch (error) {
                console.error("Failed to fetch machines", error);
            }
        };
        fetchMachines();
    }, [userFactory, activeDept, user?.account?.username]);

    const handleSelectMachine = (val: string) => {
        setSelectedMachine(val);
    };

    const [currentShiftNm, setCurrentShiftNm] = useState<string>('');
    const [displayTime, setDisplayTime] = useState<string>('');
    const prevHourRef = useRef<number>(-1);
    const [shiftCheckTrigger, setShiftCheckTrigger] = useState<number>(0);

    // Fetch shift data when machine changes
    useEffect(() => {
        if (!selectedMachine) {
            setShiftData([], '');
            return;
        }

        // Skip fetching if we already have it for this machine
        if (lastShiftMachine === selectedMachine && shiftData.length > 0) {
            return;
        }

        const fetchShift = async () => {
            try {
                const res = await getMachineShift_api(selectedMachine);
                setShiftData(res || [], selectedMachine);
            } catch (e) {
                console.error("Failed to fetch shift", e);
            }
        };
        fetchShift();
    }, [selectedMachine]);

    // ── Server time sync: on login + every hour at :00:00 ──────────────
    const { resetTimeState } = useAppStore();
    const lastTimeFetchUserRef = useRef<string>('');
    const fetchTimeRef = useRef<() => Promise<void>>(async () => { });

    // Define fetchTime and keep it in a ref so the tick can call it
    useEffect(() => {
        const currentUser = user?.account?.username || '';

        const fetchTime = async (retryCount = 0) => {
            try {
                const res = await getServerTime_api();
                const timeStr = res?.time as string;   // "HH:mm:ss"
                const dateStr = res?.date as string;   // "yyyy-MM-dd"
                if (timeStr && dateStr) {
                    // Build full server datetime purely from server response — NEVER use local device date
                    const serverNow = new Date(`${dateStr}T${timeStr}`);
                    if (!isNaN(serverNow.getTime())) {
                        const offset = serverNow.getTime() - Date.now();
                        setServerTimeOffset(offset);
                    }
                    setServerDate(dateStr);
                } else if (timeStr) {
                    // Fallback: only time available (shouldn't happen normally)
                    console.warn('[TimeSync] Server returned time but no date — offset may be inaccurate');
                }
            } catch (e) {
                console.error('[TimeSync] Failed to fetch server time', e);
                // Retry up to 2 times on failure
                if (retryCount < 2) {
                    setTimeout(() => fetchTime(retryCount + 1), 2000);
                }
            }
        };
        fetchTimeRef.current = fetchTime;

        // Always re-fetch when user changes (new login)
        if (currentUser && currentUser !== lastTimeFetchUserRef.current) {
            lastTimeFetchUserRef.current = currentUser;
            prevHourRef.current = -1;
            fetchTime();
        } else if (!hasFetchedTime) {
            fetchTime();
        }
    }, [hasFetchedTime, user?.account?.username]);

    // Tick every 1s: update display time + re-sync from server every hour change
    useEffect(() => {
        const tick = () => {
            const now = new Date(Date.now() + serverTimeOffset);
            const currentHour = now.getHours();
            const hh = String(currentHour).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            setDisplayTime(`${hh}:${mm}:${ss}`);

            // Hour changed → re-fetch server time + date (covers midnight too)
            // Also reset shift fetch key so checkActiveShift re-runs at shift boundaries
            if (prevHourRef.current >= 0 && prevHourRef.current !== currentHour) {
                fetchTimeRef.current();
                // Force re-check active shift at every hour change (shift boundaries)
                // e.g., HC→Shift2 at 14:00 — must call API to keep override shift
                // Reset fetchKey ref AND increment trigger to force useEffect re-run
                lastShiftFetchKeyRef.current = '';
                setShiftCheckTrigger(prev => prev + 1);
            }
            prevHourRef.current = currentHour;
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [serverTimeOffset]);

    const [overrideActiveShift, setOverrideActiveShift] = useState<{ shift: string, date: string } | null>(null);
    const lastShiftFetchKeyRef = useRef<string>('');

    // Call API to check if there is an active shift for today that should override
    // Uses a ref to prevent re-fetching when serverDate is overridden by the result
    useEffect(() => {
        if (!factory || !serverDate || !user?.account?.username) {
            setOverrideActiveShift(null);
            return;
        }

        const fetchKey = `${activeDept}_${factory}_${serverDate}_${user.account.username}`;
        if (lastShiftFetchKeyRef.current === fetchKey) return;
        lastShiftFetchKeyRef.current = fetchKey;

        const fetchOverride = async () => {
            try {
                let res;
                if (activeDept === 'PADPRINT') {
                    res = await checkActiveShiftPadPrint_api(factory, serverDate, userCode);
                } else if (activeDept === 'EMBROIDERY') {
                    res = await checkActiveShiftEmbroidery_api(factory, serverDate, userCode);
                } else {
                    res = await checkActiveShift_api(factory, serverDate, userCode);
                }

                if (res && res.length > 0) {
                    const dbShift = res[0].Shift;
                    const dbDate = res[0].SysCreateDate;
                    if (dbShift) {
                        let datePart = serverDate;
                        if (dbDate) {
                            const d = new Date(dbDate);
                            if (!isNaN(d.getTime())) {
                                const yyyy = d.getFullYear();
                                const mm = String(d.getMonth() + 1).padStart(2, '0');
                                const dd = String(d.getDate()).padStart(2, '0');
                                datePart = `${yyyy}-${mm}-${dd}`;
                            } else {
                                datePart = String(dbDate).substring(0, 10);
                            }
                        }

                        setOverrideActiveShift({ shift: dbShift, date: datePart });
                        return;
                    }
                }
                setOverrideActiveShift(null);
            } catch (e) {
                console.error("Failed to check active shift override", e);
                setOverrideActiveShift(null); // Fallback to time-based shift on API error
            }
        };
        fetchOverride();
    }, [factory, serverDate, user?.account?.username, activeDept, shiftCheckTrigger]);

    // Calculate current shift and shiftType
    useEffect(() => {
        if (overrideActiveShift) {
            const dbShift = overrideActiveShift.shift;
            // DB returns: 'HC', '1', '2', '3' — map to display name
            let finalShiftNm = dbShift;
            if (dbShift === 'HC') finalShiftNm = 'Hành chính';
            // '1', '2', '3' are already fine as display names

            setCurrentShiftNm(finalShiftNm);

            // For Shift 3, convert to '31' or '32' based on server time
            // ShiftType 31 = 00:00→06:00 (after midnight part)
            // ShiftType 32 = 22:00→00:00 (before midnight part)
            if (dbShift === '3' && displayTime) {
                const hour = parseInt(displayTime.split(':')[0], 10);
                setShiftType(hour < 6 ? '31' : '32');
            } else {
                setShiftType(dbShift);
            }

            return;
        }

        if (shiftData.length === 0 || !displayTime) {
            setCurrentShiftNm('');
            setShiftType('');
            return;
        }

        const parts = displayTime.split(':');
        const currentHour = parseInt(parts[0], 10);
        const currentMins = currentHour * 60 + parseInt(parts[1], 10);

        const shifts = shiftData.map(s => {
            let hr01 = s.WrkHr01;
            if (hr01) {
                const hrStr = String(hr01);
                const hours = Math.floor(parseInt(hrStr, 10) / 100);
                const mins = parseInt(hrStr, 10) % 100;
                let startMins = hours * 60 + mins - 5; // Minus 5 margin
                if (startMins < 0) startMins += 24 * 60;

                let displayName = s.ShiftNm;
                const wId = Number(s.WrkHrId);
                if (wId === 1) displayName = 'Hành chính';
                else if (wId === 2) displayName = '1';
                else if (wId === 3) displayName = '2';
                else if (wId === 4) displayName = '3';

                return { name: displayName, wId, startMins, original: s };
            }
            return null;
        }).filter(Boolean) as { name: string, wId: number, startMins: number, original: any }[];

        if (shifts.length === 0) return;

        shifts.sort((a, b) => a.startMins - b.startMins);

        // Default to the last one for wrap-around overnight cases
        let activeShift = shifts[shifts.length - 1];
        for (let i = 0; i < shifts.length; i++) {
            if (currentMins >= shifts[i].startMins) {
                activeShift = shifts[i];
            }
        }
        setCurrentShiftNm(activeShift.name);

        // Calculate shiftType based on rules:
        // Shift 1 (wId=2) → ShiftType '1'
        // Shift 2 (wId=3) → ShiftType '2'
        // Shift HC (wId=1) → ShiftType 'HC'
        // Shift 3 (wId=4) → ShiftType '31' nếu 00:00~06:00, '32' nếu 22:00~00:00
        let computedShiftType = '';
        if (activeShift.wId === 1) {
            computedShiftType = 'HC';
        } else if (activeShift.wId === 2) {
            computedShiftType = '1';
        } else if (activeShift.wId === 3) {
            computedShiftType = '2';
        } else if (activeShift.wId === 4) {
            // ShiftType 31 = 00:00→06:00 (after midnight part)
            // ShiftType 32 = 22:00→00:00 (before midnight part)
            if (currentHour < 6) {
                computedShiftType = '31';
            } else {
                computedShiftType = '32';
            }
        }
        setShiftType(computedShiftType);

    }, [shiftData, displayTime, overrideActiveShift]);
    // -----------------------

    const formatName = (fullName = "") => {
        if (!fullName) return "";

        const parts = fullName.trim().split(/\s+/);

        if (parts.length === 1) return parts[0];

        const lastName = parts.pop();
        const initials = parts.map(p => p.charAt(0).toUpperCase()).join(".");

        return `${initials}.${lastName}`;
    };

    const handleLogout = useCallback(() => {
        setLoading(true);
        setAnchorEl(null);
        resetTimeState(); // Reset server date/time so next login re-fetches
        setTimeout(() => {
            logout();
            setLoading(false);
        }, 500);
    }, [logout, setLoading, resetTimeState]);

    return <Stack direction={'row'} spacing={1}
        sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '7px' }}>
        {displayTime && (
            <Typography sx={{ color: (theme) => theme.color.text.o1, fontWeight: 'bold' }}>
                {displayTime}
            </Typography>
        )}
        {currentShiftNm && (
            <Typography sx={{ color: (theme) => theme.color.primary.o6, fontWeight: 'bold', ml: 1, mr: 1 }}>
                Shift: {currentShiftNm}
            </Typography>
        )}
        <FormControl>
            <Select
                sx={{ minWidth: '120px', ml: 2 }}
                size="small"
                value={selectedFactoryDisplay}
                onChange={(e) => handleSelectFactory(e.target.value)}
            >
                <MenuItem value={'F1'}>Factory 1</MenuItem>
                <MenuItem value={'F2'}>Factory 2</MenuItem>
                <MenuItem value={'F3'}>Factory 3</MenuItem>
                <MenuItem value={'TS'}>TANS</MenuItem>
            </Select>
        </FormControl>

        {(activeDept === 'HEAT TRANSFER' || activeDept === 'EMBROIDERY' || activeDept === 'PADPRINT') && (
            <FormControl>
                <Select
                    sx={{ minWidth: '120px', ml: 1 }}
                    size="small"
                    value={selectedMachine}
                    onChange={(e) => handleSelectMachine(e.target.value)}
                    displayEmpty
                >
                    {machinesList.length === 0 && <MenuItem value="" disabled>No Machine</MenuItem>}
                    {machinesList.map((mc: any, idx) => (
                        <MenuItem key={idx} value={mc.McID}>{mc.McID}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        )}

        <FormControl>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                size='small'
                sx={{ width: '100px', ml: 2 }}
                value={lang}
                onChange={handleChange}
            >
                {LANGUAGES.map(({ language, text, imgUrl }: any, index: number) => (
                    <MenuItem key={index} value={language} sx={{ textAlign: 'center' }}>
                        <Box
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '7px' }}
                        >
                            <Avatar
                                variant={'square'}
                                alt={'logo'}
                                src={imgUrl}
                                sx={{ borderRadius: '50%', width: '20px', height: '20px' }}
                            />
                            <Typography>{text}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
        {/*<FormGroup>*/}
        {/*    <FormControlLabel*/}
        {/*        control={*/}
        {/*            <MaterialUISwitch*/}
        {/*                sx={{ ml: 4, mr: -2 }}*/}
        {/*                checked={mode === 'dark'}*/}
        {/*                onChange={toggleMode}*/}
        {/*            />*/}
        {/*        }*/}
        {/*        label=""*/}
        {/*    />*/}
        {/*</FormGroup>*/}
        <IconButton
            onClick={toggleFullScreen}
            sx={{
                width: 40,
                height: 40,
                color: (theme) => theme.color.text.o5,
            }}>
            {isFullScreen ?
                <FullscreenExitIcon sx={{ width: 35, height: 35, borderRadius: "50%" }} />
                :
                <FullscreenIcon sx={{ width: 35, height: 35, borderRadius: "50%" }} />
            }
        </IconButton>
        <Typography sx={{ color: (theme) => theme.color.text.o1, fontWeight: 'bold' }}>
            {formatName(user?.account?.fullname?.trim())}
        </Typography>
        <IconButton
            onClick={handleClick}
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}>
            <Avatar src={"/default-avatar.png"} />
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
                paper: {
                    elevation: 3,
                    sx: {
                        minWidth: 220,
                        borderRadius: 3,
                        mt: 1.5,
                        overflow: 'visible',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            backgroundColor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <Box sx={{ px: 2.5, py: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mt: 1.2, fontWeight: 600 }}>
                    {user?.account.fullname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    @{user?.account.username}
                </Typography>
            </Box>

            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                    <LogoutOutlined fontSize="small" />
                </ListItemIcon>
                Logout
            </MenuItem>
        </Menu>
    </Stack>
})

const ToggleAppbarSuffix = memo(() => {
    const { lang, setLang } = useLocale();
    const { mode, toggleMode } = useThemeContext();
    const { isFullScreen, toggleFullScreen } = useFullScreen();
    const { user, logout } = useAuth();
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuToggle = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLanguageChange = (event: SelectChangeEvent<string>) => {
        setLang(event.target.value as Lang);
    };

    const handleLogout = useCallback(() => {
        setLoading(true);
        handleMenuClose();
        setTimeout(() => {
            logout();
            setLoading(false);
        }, 500);
    }, [logout, setLoading, handleMenuClose]);
    const { handleSelectFactory, factory, selectedFactoryDisplay } = useDepartment();
    return (
        <>
            <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                    onClick={handleMenuToggle}
                    aria-controls={open ? 'settings-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    sx={{ color: (theme) => theme.color.text.o5 }}
                >
                    <SettingsIcon />
                </IconButton>
            </Stack>

            <Menu
                id="settings-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{ 'aria-labelledby': 'settings-button' }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 2
                    }}
                >
                    {/* <Avatar
                    alt="avatar"
                    src={avatar}
                    sx={{ backgroundColor: '#C7C8CC', borderRadius: '50%', width: 70, height: 70 }}
                /> */}
                    <Typography sx={{ color: (theme) => theme.color.text.o1, fontSize: '14px', fontWeight: 600, mt: 1 }}>
                        {user?.account.fullname}
                    </Typography>
                    <Typography
                        sx={{ color: (theme) => theme.color.text.o1, fontSize: '14px', fontWeight: 600, mt: 0.5 }}>
                        {user?.account.username}
                    </Typography>
                </Box>
                <MenuItem disableRipple>
                    <FormControl fullWidth>
                        <Select
                            labelId="demo-select-small-label"
                            id="demo-select-small"
                            size='small'
                            sx={{ minWidth: '110px' }}
                            value={selectedFactoryDisplay}
                            onChange={(e) => handleSelectFactory(e.target.value)}
                        >
                            <MenuItem value={'F1'}>Factory 1</MenuItem>
                            <MenuItem value={'F2'}>Factory 2</MenuItem>
                            <MenuItem value={'F3'}>Factory 3</MenuItem>
                            <MenuItem value={'TS'}>TANS</MenuItem>
                            {/*<MenuItem value={'F4'}>Factory 4</MenuItem>*/}
                        </Select>
                    </FormControl>
                </MenuItem>
                {/*<MenuItem disableRipple>*/}
                {/*    <FormControl fullWidth>*/}
                {/*        <Select*/}
                {/*            labelId="demo-select-small-label"*/}
                {/*            id="demo-select-small"*/}
                {/*            size='small'*/}
                {/*            sx={{ minWidth: '170px' }}*/}
                {/*            value={selectedDeptId}*/}
                {/*            onChange={(e) => onChangeDepartment(String(e.target.value))}*/}
                {/*        >*/}
                {/*            {departmentsFromApi.map(d => (*/}
                {/*                <MenuItem key={d.id_dept} value={d.id_dept}>*/}
                {/*                    {d.name_dept}*/}
                {/*                </MenuItem>*/}
                {/*            ))}*/}
                {/*        </Select>*/}
                {/*    </FormControl>*/}
                {/*</MenuItem>*/}
                <MenuItem disableRipple>
                    <FormControl fullWidth>
                        <Select
                            size="small"
                            value={lang}
                            onChange={handleLanguageChange}
                            sx={{ minWidth: '150px' }}
                        >
                            {LANGUAGES.map(({ language, text, imgUrl }: any, index: number) => (
                                <MenuItem key={index} value={language}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                            src={imgUrl}
                                            alt={text}
                                            sx={{ width: 20, height: 20, borderRadius: '50%' }}
                                        />
                                        <Typography>{text}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </MenuItem>
                {/*<MenuItem disableRipple>*/}
                {/*    <FormGroup>*/}
                {/*        <FormControlLabel*/}
                {/*            control={*/}
                {/*                <MaterialUISwitch*/}
                {/*                    checked={mode === 'dark'}*/}
                {/*                    onChange={toggleMode}*/}
                {/*                />*/}
                {/*            }*/}
                {/*            label={mode === 'dark' ? 'Light mode' : 'Dark mode'}*/}
                {/*        />*/}
                {/*    </FormGroup>*/}
                {/*</MenuItem>*/}

                <MenuItem onClick={toggleFullScreen}>
                    <ListItemIcon sx={{ color: (theme) => theme.color.text.o5 }}>
                        {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </ListItemIcon>
                    <Typography>{isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon sx={{ color: (theme) => theme.color.text.o5 }}><LogoutIcon /></ListItemIcon>
                    <Typography>Logout</Typography>
                </MenuItem>
            </Menu>

            {/* You can use your existing change password dialog */}
            {/* <ChangePasswordDialog open={openDialog} onClose={handleOnCloseDialog} /> */}
        </>
    );
});

const MemoizedAppBar = memo(({ isOpen, toggle }: { isOpen: boolean; toggle: () => void; }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [openCollapse, setOpenCollapse] = useState<boolean>(isOpen);
    const handleOpen = () => {
        if (openCollapse) {
            setOpenCollapse(false)
        }
        toggle();
    }

    return (
        <AppBar position="fixed" open={isOpen} elevation={0}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                >
                    {!isOpen && isMobile && (
                        <IconButton onClick={handleOpen}>
                            <MenuOutlined color="primary" />
                        </IconButton>
                    )}
                </Stack>

                {/* Spacer to push items to the right */}
                <Box sx={{ flexGrow: 1 }} />

                <AppbarSuffix />
                {/*{!isMobile ? (*/}
                {/*    <AppbarSuffix />*/}
                {/*) : (*/}
                {/*    <ToggleAppbarSuffix />*/}
                {/*)}*/}
            </Toolbar>
            <Divider sx={{ borderColor: (theme) => theme.color.background.o5 }} />
        </AppBar>
    );
});

const MemoizedDrawer = memo(({ isOpen, toggle }: {
    isOpen: boolean;
    toggle: () => void;
}) => {
    const [openCollapse, setOpenCollapse] = useState<boolean>(isOpen);
    const toggleCollapse = () => {
        if (!isOpen) {
            toggle();
        }
        setOpenCollapse(prev => !prev);
    };

    const handleOpen = () => {
        if (openCollapse) {
            setOpenCollapse(false)
        }
        toggle();
    }
    return (
        <Drawer variant={"permanent"} open={isOpen}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DrawerHeader isOpen={isOpen}>
                    {isOpen && <LogoKadex />}
                    <IconButton onClick={handleOpen}>
                        {isOpen ? <MenuOpen color={'primary'} /> : <MenuOutlined color={'primary'} />}
                    </IconButton>
                </DrawerHeader>
                <Divider sx={{ borderColor: (theme) => theme.color.background.o5 }} />
                <DrawerListMenuItem
                    isDrawerOpen={isOpen}
                    openCollapse={openCollapse}
                    toggleCollapse={toggleCollapse}
                />
                <Box
                    sx={{
                        marginTop: 'auto',
                        padding: isOpen ? 2 : '16px 0',
                        textAlign: isOpen ? 'left' : 'center',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '13px',
                            color: (theme) => theme.color.text.o1,
                            mb: isOpen ? 1 : 0
                        }}
                    >
                        {VERSION}
                    </Typography>
                    {isOpen && (
                        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: (theme) => theme.color.text.o5 }}
                            color="textSecondary">
                            Copyright © Trax Group. All rights reserved
                        </Typography>
                    )}
                </Box>
            </Box>
        </Drawer>
    )
});


export default function DrawerBar({ isOpen, toggle, children }: DrawerSideBarProps) {
    const Content = (
        <Box sx={{
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
        }}>
            <MemoizedAppBar isOpen={!isOpen} toggle={toggle} />
            <MemoizedDrawer isOpen={!isOpen} toggle={toggle} />
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                ml: 2,
                mr: 2,
                overflow: 'hidden',
            }}>
                <DrawerHeader isOpen={isOpen} />
                <Box sx={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <ContentLayout>
                        {children}
                    </ContentLayout>
                </Box>
            </Box>
        </Box>
    );

    return Content;
}