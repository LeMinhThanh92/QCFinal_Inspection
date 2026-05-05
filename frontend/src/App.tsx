/// <reference types="vite-plugin-svgr/client" />

import '@/App.css'
import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router-dom";
import { publicRoutes } from "@/routers/public";
import GlobalSnackbar from "@/features/shared/components/GlobalSnackbar.tsx";
import { useProtectedRoutes } from "@/routers/protected.tsx";
import { PageLogin } from "@/features/auth/PageLogin";
import { useAuth } from "@/utils/context/AuthProvider.tsx";
import storage from "@/utils/storage.ts";
import { Box } from "@mui/material";
import { useLoading } from "@/utils/context/LoadingProvider.tsx";
import { ScreenLoaderBackdrop } from "@components/Loading/ScreenLoaderBackdrop.tsx";
import GlobalDialog from './features/shared/components/GlobalDialog';
import {useEffect, useMemo, useState} from "react";

const useAppRouter = () => {
    const token = storage.getToken();
    const { user } = useAuth();
    const commonRoutes = [{ path: '/', element: <PageLogin /> }];
    const protectedRoutes = useProtectedRoutes();

    const isAuthenticated = user !== null || !!token;
    const routes = isAuthenticated ? protectedRoutes : publicRoutes;
    
    // Fix Vite's './' base path for React Router
    let basePath = import.meta.env.BASE_URL || '/';
    if (basePath === './') {
        basePath = '/';
    }

    return useMemo(() => {
        const isCapacitor = !!(window as any).Capacitor;
        const allRoutes = [...routes, ...commonRoutes];
        
        if (isCapacitor) {
            return createHashRouter(allRoutes);
        }
        return createBrowserRouter(allRoutes, { basename: basePath });
    }, [isAuthenticated, basePath, routes]);
}


function App() {
    const { loading } = useLoading();

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            html, body {
                overflow: hidden !important;
                overscroll-behavior: none !important;
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
                top: 0 !important;
                left: 0 !important;
            }
        `;
        document.head.appendChild(style);

        const preventOverscroll = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            let el: HTMLElement | null = target;
            while (el && el !== document.body) {
                const style = window.getComputedStyle(el);
                const overflow = style.overflow + style.overflowX + style.overflowY;
                if (overflow.includes('auto') || overflow.includes('scroll')) {
                    const isScrollableY = el.scrollHeight > el.clientHeight;
                    const isScrollableX = el.scrollWidth > el.clientWidth;
                    if (isScrollableY || isScrollableX) return;
                }
                el = el.parentElement;
            }
            e.preventDefault();
        };

        document.addEventListener('touchmove', preventOverscroll, { passive: false });

        return () => {
            document.head.removeChild(style);
            document.removeEventListener('touchmove', preventOverscroll);
        };
    }, []);

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        }}>
            <ScreenLoaderBackdrop open={loading} />
            <GlobalSnackbar />
            <GlobalDialog />

            <AppContent />
        </Box>
    )
}

function AppContent() {
    const router = useAppRouter();
    return <RouterProvider router={router} />;
}

export default App
