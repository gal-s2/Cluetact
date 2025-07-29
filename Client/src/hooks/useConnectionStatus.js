import { useEffect, useState } from "react";
import socket from "../services/socket";

function useConnectionStatus() {
    const [isDisconnected, setIsDisconnected] = useState(!socket.connected || !navigator.onLine);

    useEffect(() => {
        const handleDisconnect = () => setIsDisconnected(true);
        const handleConnect = () => setIsDisconnected(false);
        const handleReconnect = () => setIsDisconnected(false);
        const handleConnectError = () => setIsDisconnected(true);

        // Network events
        const handleOffline = () => setIsDisconnected(true);
        const handleOnline = () => {
            // Only clear disconnect if socket is connected
            if (socket.connected) setIsDisconnected(false);
        };

        socket.on("disconnect", handleDisconnect);
        socket.on("connect", handleConnect);
        socket.on("reconnect", handleReconnect);
        socket.on("connect_error", handleConnectError);

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        // Initial check
        if (!navigator.onLine) {
            setIsDisconnected(true);
        }

        return () => {
            socket.off("disconnect", handleDisconnect);
            socket.off("connect", handleConnect);
            socket.off("reconnect", handleReconnect);
            socket.off("connect_error", handleConnectError);

            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    return isDisconnected;
}

export default useConnectionStatus;
