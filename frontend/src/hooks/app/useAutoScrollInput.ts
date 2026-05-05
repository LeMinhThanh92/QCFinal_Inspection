import { useEffect } from 'react';

const useAutoScrollInput = () => {
    useEffect(() => {
        const handler = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        };

        document.addEventListener('focusin', handler);
        return () => {
            document.removeEventListener('focusin', handler);
        };
    }, []);
};

export default useAutoScrollInput;