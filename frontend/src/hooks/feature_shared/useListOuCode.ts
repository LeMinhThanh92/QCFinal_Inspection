import { useEffect, useState } from "react";

export const useListOuCode = () => {
    const [listOuCode, setListOuCode] = useState<any>([]);
    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const response = await fetch(`/ouCode.json`);
                const data = await response.json();
                setListOuCode(data);
            } catch (error) {
                console.error('Error loading translations:', error);
            }
        };
        loadTranslations();
    }, []);
    return { listOuCode }
}