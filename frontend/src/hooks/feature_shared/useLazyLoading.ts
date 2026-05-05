import React, { useEffect, useRef, useState } from 'react';

type useLazyLoadingGridProps<T> = {
    fetchData: (params: any) => Promise<T[]>;
    searchParams: any;
    isCondition?: any
};

export const useLazyLoadingGrid = <T,>({ fetchData, searchParams, isCondition }: useLazyLoadingGridProps<T>) => {
    const [rows, setRows] = useState<T[]>([]);
    const [page, setPage] = useState<number>(0);
    const pageRef = useRef<number>(0);
    const [shouldLoadMore, setShouldLoadMore] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const rowCountRef = useRef<number>(0);
    const gridWrapperRef = useRef<HTMLDivElement>(null);
    const hasReachedBottomRef = useRef(false);
    const rowCount = React.useMemo(() => {
        if (rows && rows.length > 0) {
            rowCountRef.current = (rows[0] as any)?.totalRows ?? 0;
        }
        return rowCountRef.current;
    }, [rows]);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    const isValidParams = (condition?: any) => {
        if (typeof condition === "undefined") return true;
        return !!condition;
    };
    const loadMore = async () => {
        const totalPage = Math.ceil(rowCount / 10);
        if ((pageRef.current >= totalPage) && pageRef.current != 0) return
        if (isFetching || !isValidParams(isCondition)) return;
        setIsFetching(true);

        try {
            const newData = await fetchData({
                ...searchParams,
                PageIndex: pageRef.current,
                PageSize: 10,
            });
            const safeData = Array.isArray(newData) ? newData : [];
            setRows((prev: T[]) => {
                const merged = [...prev, ...safeData];

                const seenRowNums = new Set<number>();
                const uniqueByRowNum = merged.filter((item: any) => {
                    if (seenRowNums.has(item.rowNum)) {
                        return false;
                    }
                    seenRowNums.add(item.rowNum);
                    return true;
                });

                return uniqueByRowNum;
            });
            setPage((prev: number) => prev + 1);
            pageRef.current += 1;
        } finally {
            setIsFetching(false);
        }
    };

    const fetchDataTicket = async () => {
        if (isFetching) return;
        setIsFetching(true);

        try {
            const newData = await fetchData({
                ...searchParams,
                PageIndex: 0,
                PageSize: 10,
            });
            const safeData = Array.isArray(newData) ? newData : [];
            setRows(safeData);
            setPage(0);
            pageRef.current = 0;
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (shouldLoadMore) {
            loadMore();
            setShouldLoadMore(false);
        }
    }, [shouldLoadMore]);

    useEffect(() => {
        setRows([]);
        setPage(0);
        pageRef.current = 0;
        loadMore();
    }, [JSON.stringify(searchParams)]);

    useEffect(() => {
        const handleScroll = (e: any) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            const isBottom = scrollTop + clientHeight >= scrollHeight - 10;

            if (isBottom && !hasReachedBottomRef.current) {
                hasReachedBottomRef.current = true;
                console.log("✅ Scroll tới đáy");
                setShouldLoadMore(true);
            }

            if (!isBottom && hasReachedBottomRef.current) {
                hasReachedBottomRef.current = false;
            }
        };
        const scrollEl = gridWrapperRef.current?.querySelector('.MuiDataGrid-virtualScroller');

        if (scrollEl) {
            scrollEl.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollEl) {
                scrollEl.removeEventListener('scroll', handleScroll);
            }
        };
    }, [gridWrapperRef.current]);

    return {
        gridWrapperRef,
        rows,
        isFetching,
        rowCount,
        fetchDataTicket
    };
};
