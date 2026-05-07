import { Navigate } from "react-router-dom";
import { PageNavigation } from "@/features/navigation/PageNavigation.tsx";
import { PageComingSoon } from "@/features/shared/PageComingSoon.tsx";
import { PageInspection } from "@/features/inspection/PageInspection";
import DrawerBar from "@/components/SideBar/DrawerBar.tsx";

const Layout = ({ children }: { children: React.ReactNode }) => (
    <DrawerBar>{children}</DrawerBar>
);

export const useProtectedRoutes = () => {
    const baseChildren = [
        {
            path: '/sample-room',
            element: <Layout><PageComingSoon /></Layout>,
        },
        {
            path: '/coming-soon',
            element: <Layout><PageComingSoon /></Layout>,
        },
        {
            path: '/inspection',
            element: <Layout><PageInspection /></Layout>,
        },
        {
            path: '/moisture',
            element: <Layout><PageComingSoon /></Layout>,
        },
        {
            path: '/moisture-report',
            element: <Layout><PageComingSoon /></Layout>,
        },
        { path: '*', element: <Navigate to="/" replace /> }
    ];

    const routes = [
        {
            path: '/navigation',
            element: <PageNavigation />,
        },
        {
            path: '/',
            element: <Layout><PageInspection /></Layout>,
        },
        {
            path: '/sample-room',
            element: <Layout><PageComingSoon /></Layout>,
        },
        {
            path: '/inspection',
            element: <Layout><PageInspection /></Layout>,
        },
        {
            path: '/moisture',
            element: <Layout><PageComingSoon /></Layout>,
        },
        {
            path: '/moisture-report',
            element: <Layout><PageComingSoon /></Layout>,
        },
        { path: '*', element: <Navigate to="/" replace /> }
    ];

    return routes;
};
