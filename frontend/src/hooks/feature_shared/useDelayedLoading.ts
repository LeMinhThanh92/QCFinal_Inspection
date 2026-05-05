import { useEffect, useState } from 'react';

export const useDelayedLoading = (isFetching: boolean, delayMs = 3000) => {
    const [delayedLoading, setDelayedLoading] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isFetching) {
            setDelayedLoading(true);
            timeout = setTimeout(() => {
                setDelayedLoading(false);
            }, delayMs);
        } else {
            timeout = setTimeout(() => {
                setDelayedLoading(false);
            }, delayMs);
        }

        return () => clearTimeout(timeout);
    }, [isFetching, delayMs]);

    return isFetching || delayedLoading;
}
