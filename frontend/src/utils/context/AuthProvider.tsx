import React, {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import storage from '@/utils/storage.ts';
import {useApiSend} from "@/hooks/app/useApiSend.ts";
import {loginRequest, LoginRequest, logoutRequest, validateSession} from "@/network/urls/auth.ts";
import {toast} from "@/utils/states/state.ts";

type AuthAccount = {
    account: {
        id: number;
        username: string;
        fullname: string;
        employeeCode: string;
        department?:string;
    };
};

export type Machine = {
    MachineId: number;
    MachineCode: string;
    FactoryCode: string
};


const _b64DecodeUnicode = (str: string): string => {
    try {
        while (str.length % 4 !== 0) {
            str += '=';
        }

        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
    } catch (e) {
        console.error('Failed to decode base64 string', e);
        return '';
    }
};

const _mapAccountFromToken = (): AuthAccount | null => {
    try {
        const token = storage.getToken();
        if (!token) {
            console.error('No token found');
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid token format');
            return null;
        }

        const payload = parts[1];
        const decodedPayload = _b64DecodeUnicode(payload);

        return JSON.parse(decodedPayload);
    } catch (e) {
        console.error('Failed to map account from token', e);
        return null;
    }
};

interface AuthContextProps {
    user: AuthAccount | null;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/** How often to check if our session is still active (ms) */
const SESSION_CHECK_INTERVAL = 15_000;

const AuthProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthAccount | null>(null);
    const queryClient = useQueryClient();
    const sessionCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);


    const handleUserResponse = async (data: any) => {
        storage.setToken(data.token);
        const account = _mapAccountFromToken();
        setUser(account);
        localStorage.setItem('machines', JSON.stringify(data.machines));
        return account;
    };

    const loadUser = useCallback(() => {

        if (storage.getToken()) {
            const account = _mapAccountFromToken();
            setUser(account);
            return account;
        }
        setUser(null);
        return null;
    }, []);

    const {mutateAsync: login} = useApiSend(
        loginRequest,
        handleUserResponse,
        (error) => {
            console.error("Login failed", error);
        }
    );

    const logoutResponse  = () => {
        storage.clearToken();
        setUser(null);
        queryClient.clear();
        localStorage.removeItem('machines');
        window.location.replace("/");
    };


    const {mutateAsync: logout} = useApiSend(
        logoutRequest,
        logoutResponse,
        (error: string) => {
            toast.value = {
                ...toast.value,
                message: error,
            };
        }
    )

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // ------------------------------------------------------------------
    // Periodic session validation — detect login from another device
    // ------------------------------------------------------------------
    useEffect(() => {
        // Clear any existing interval
        if (sessionCheckRef.current) {
            clearInterval(sessionCheckRef.current);
            sessionCheckRef.current = null;
        }

        // Only poll if there's a logged-in user
        if (!user || !storage.getToken()) return;

        const checkSession = async () => {
            try {
                await validateSession();
                // Session still valid — nothing to do
            } catch (_err) {
                // 401 → token was superseded by another login
                console.warn('Session invalidated — logged in from another device');
                // Stop polling immediately
                if (sessionCheckRef.current) {
                    clearInterval(sessionCheckRef.current);
                    sessionCheckRef.current = null;
                }
                // Force logout on this device
                storage.clearToken();
                setUser(null);
                queryClient.clear();
                localStorage.removeItem('machines');

                toast.value = {
                    ...toast.value,
                    message: 'SESSION_KICKED',
                    isExpired: true,
                };
            }
        };

        sessionCheckRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

        return () => {
            if (sessionCheckRef.current) {
                clearInterval(sessionCheckRef.current);
                sessionCheckRef.current = null;
            }
        };
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export {AuthProvider, useAuth};
