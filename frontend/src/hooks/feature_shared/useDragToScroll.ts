import { useEffect, useRef } from 'react';

/**
 * Generic hook for drag-to-scroll on a container's inner scrollable element.
 * @param scrollerSelector CSS selector for the inner scrollable element (e.g. '.MuiDataGrid-virtualScroller')
 * @returns ref to attach to the outer container element
 */
export function useDragToScroll(scrollerSelector: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const getScroller = () =>
            el.querySelector(scrollerSelector) as HTMLElement | null;

        const onMouseDown = (e: MouseEvent) => {
            const scroller = getScroller();
            if (!scroller) return;
            isDragging.current = true;
            startX.current = e.pageX;
            scrollLeftStart.current = scroller.scrollLeft;
            el.style.cursor = 'grabbing';
            el.style.userSelect = 'none';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const scroller = getScroller();
            if (!scroller) return;
            const dx = e.pageX - startX.current;
            scroller.scrollLeft = scrollLeftStart.current - dx;
        };

        const onMouseUp = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            el.style.cursor = '';
            el.style.userSelect = '';
        };

        el.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [scrollerSelector]);

    return containerRef;
}
