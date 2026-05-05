import { useState, useEffect, useCallback } from "react";

const useFullScreen = () => {
    const [isFullScreen, setIsFullScreen] = useState<boolean>(!!document.fullscreenElement);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, []);

    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err =>
                console.error("Lỗi khi vào fullscreen:", err)
            );
        } else {
            document.exitFullscreen().catch(err =>
                console.error("Lỗi khi thoát fullscreen:", err)
            );
        }
    }, []);

    return { isFullScreen, toggleFullScreen };
};

export default useFullScreen;
