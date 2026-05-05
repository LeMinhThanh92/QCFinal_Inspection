import { useWebSocket } from '@/hooks/feature_shared/useWebSocket';

export const useChangeStatusMachine = (
    pathGroupId: any
) => {
    const { sendMessage, isConnected } = useWebSocket({
        url: "status/update-status",
    });

    const handleChangeStatusMachine = (value: "Busy" | "Ready") => {
        const data = {
            "machine_id": pathGroupId,
            "status": value,
        };
        if (isConnected) {
            sendMessage(JSON.stringify(data));
        } else {
            console.error("WebSocket is not connected. Unable to send status.");
        }
    };

    return {
        isConnected,
        handleChangeStatusMachine
    }
}
