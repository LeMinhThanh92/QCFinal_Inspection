import {createContext, ReactNode, useContext, useState} from "react";

interface LoadingContextProps {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(undefined);


export const LoadingProvider = ({children}: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const progress = {loading, setLoading};
    return (
        <LoadingContext.Provider value={progress}>{children}</LoadingContext.Provider>
    );
}
export const useLoading = (): LoadingContextProps => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within LoadingProvider");
    }
    return context;
};