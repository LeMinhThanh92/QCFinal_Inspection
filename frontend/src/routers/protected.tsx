import { Navigate } from "react-router-dom";
import { PageNavigation } from "@/features/navigation/PageNavigation.tsx";
import { PageComingSoon } from "@/features/shared/PageComingSoon.tsx";
import { PageInspection } from "@/features/inspection/PageInspection";

export const useProtectedRoutes = () => {
    const baseChildren = [
        {
            path: '/sample-room',
            element: <PageComingSoon />,
        },
        {
            path: '/coming-soon',
            element: <PageComingSoon />,
        },
        {
            path: '/inspection',
            element: <PageInspection />,
        },
        { path: '*', element: <Navigate to="/" replace /> }
    ];

    const routes = [
        {
            path: '/',
            element: <PageNavigation />,
        },
        {
            path: '/sample-room',
            element: <PageComingSoon />,
        },
        {
            path: '/inspection',
            element: <PageInspection />,
        },
        { path: '*', element: <Navigate to="/" replace /> }
    ];

    return routes;
};
