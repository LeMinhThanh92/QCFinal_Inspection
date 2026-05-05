import { useEffect, useRef, useState, UIEvent } from "react";

interface UseLazyLoadProps<T> {
    fetchData: (page: number) => Promise<T[]>;
    threshold?: number;
}

export const useLazyLoad = <T extends { totalPages?: number }>({
    fetchData,
    threshold = 50,
}: UseLazyLoadProps<T>) => {
    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const lastScrollTop = useRef(0);

    const loadData = async (pageToLoad: number) => {
        if (loading || (totalPages !== null && pageToLoad >= totalPages)) return;

        setLoading(true);
        try {
            const res = await fetchData(pageToLoad);

            if (res.length === 0) return;

            // Lấy totalPages từ phần tử đầu tiên (chỉ 1 lần)
            if (totalPages === null && res[0].totalPages !== undefined) {
                setTotalPages(res[0].totalPages);
            }

            setData(prev => [...prev, ...res]);
            setPage(pageToLoad + 1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(0); // tải dữ liệu lần đầu
    }, []);

    const handleScroll = async (e: UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isScrollingDown = scrollTop > lastScrollTop.current;
        lastScrollTop.current = scrollTop;

        const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

        if (isScrollingDown && isNearBottom) {
            await loadData(page);
        }
    };

    const hasMore = totalPages === null || page < totalPages;

    return { data, handleScroll, loading, hasMore };
};
