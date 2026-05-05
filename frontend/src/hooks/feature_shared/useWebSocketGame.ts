import { useState, useEffect, useRef } from "react";

export const BASE_WS_URL = import.meta.env.VITE_APP_WS_URL_GAME as string;

const base_url = BASE_WS_URL;

type UseWebSocketProps = {
    url: string;
    onMessage?: (message: any) => void;
    onError?: (error: Event) => void;
    onOpen?: () => void;
    onClose?: () => void;
};

export const useWebSocketGame = ({
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
}: UseWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const connectWebSocket = () => {
        const socket = new WebSocket(base_url + url);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
            onOpen?.();
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            onMessage?.(event.data);
        };

        socket.onerror = (error) => {
            onError?.(error);
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            setIsConnected(false);
            onClose?.();
            console.log("WebSocket closed");
            // // Auto-reconnect logic when connection is closed
            // setTimeout(() => {
            //     console.log("Attempting to reconnect WebSocket...");
            //     connectWebSocket(); // Attempt to reconnect after 3 seconds
            // }, 3000);
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                console.log("WebSocket disconnected");
            }
        };
    }, [url]); // Dependency array includes only the `url`

    const sendMessage = (message: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.send(message);
        } else {
            console.log("WebSocket is not connected yet");
        }
    };

    const sendJson = (data: any) => {
        sendMessage(JSON.stringify(data));
    };

    return { sendMessage, sendJson, isConnected };
};