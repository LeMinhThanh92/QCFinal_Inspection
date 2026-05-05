import { PageLogin } from "@/features/auth/PageLogin";
import { Navigate } from "react-router-dom";

export const publicRoutes = [
    {
        path: '/',
        element: <PageLogin/>,
        children: [
            {
                path: '*', element: <Navigate to="." replace/>,
            },
        ],
    },
];
