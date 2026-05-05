import { BASE_SOCKET_URL } from "@/network/environment";
import { useState, useEffect, useRef } from "react";

const base_url= BASE_SOCKET_URL;

type UseWebSocketProps = {
    url: string;
    onMessage?: (message: string) => void;
    onError?: (error: Event) => void;
    onOpen?: () => void;
    onClose?: () => void;
};

export const useWebSocket = ({
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
        };

        socket.onmessage = (event) => {
            onMessage?.(event.data);
        };

        socket.onerror = (error) => {
            onError?.(error);
        };

        socket.onclose = () => {
            setIsConnected(false);
            onClose?.();
        };
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
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

    return { sendMessage, isConnected };
};