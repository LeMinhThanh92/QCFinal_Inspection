import { Navigate } from "react-router-dom";
import { PageNavigation } from "@/features/navigation/PageNavigation.tsx";
import { PageComingSoon } from "@/features/shared/PageComingSoon.tsx";
import { PageInspection } from "@/features/inspection/PageInspection";
import { PageMoisture } from "@/features/moisture/PageMoisture";
import { PagePoToday } from "@/features/inspection/PagePoToday";
import DrawerBar from "@/components/SideBar/DrawerBar.tsx";

import { PageMoistureReport } from "@/features/reports/PageMoistureReport";
import { PageInspectionReport } from "@/features/reports/PageInspectionReport";
import { PageCtqReport } from "@/features/reports/PageCtqReport";

const Layout = ({ children }: { children: React.ReactNode }) => (
    <DrawerBar>{children}</DrawerBar>
);

export const useProtectedRoutes = () => {
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
            element: <Layout><PageMoisture /></Layout>,
        },
        {
            path: '/moisture-report',
            element: <Layout><PageMoistureReport /></Layout>,
        },
        {
            path: '/inspection-report',
            element: <Layout><PageInspectionReport /></Layout>,
        },
        {
            path: '/ctq-report',
            element: <Layout><PageCtqReport /></Layout>,
        },
        {
            path: '/po-today',
            element: <Layout><PagePoToday /></Layout>,
        },
        { path: '*', element: <Navigate to="/" replace /> }
    ];

    return routes;
};
