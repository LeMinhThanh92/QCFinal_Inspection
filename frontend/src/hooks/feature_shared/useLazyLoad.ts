import { useEffect, useRef, useState, UIEvent } from "react";

export const useLazyLoad = <T>(data: T[], initialCount: number = 50, increment: number = 50) => {
    const [visibleData, setVisibleData] = useState<T[]>([]);
    const [loadedCount, setLoadedCount] = useState(initialCount);
    const lastScrollTop = useRef(0);

    useEffect(() => {
        if (data) {
            setVisibleData(data.slice(0, loadedCount));
        }
    }, [data, loadedCount]);

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isScrollingDown = scrollTop > lastScrollTop.current;
        lastScrollTop.current = scrollTop;

        if (isScrollingDown && scrollHeight - scrollTop - clientHeight < 50) {
            if (loadedCount < data.length) {
                setLoadedCount(prev => prev + increment);
            }
        }
    };

    return { visibleData, handleScroll };
};
