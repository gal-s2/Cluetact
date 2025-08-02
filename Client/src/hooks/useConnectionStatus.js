import { useEffect, useState } from "react";
import socket from "@services/socket";

function useConnectionStatus() {
    const [isDisconnected, setIsDisconnected] = useState(false);
    const [delayPassed, setDelayPassed] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setDelayPassed(true), 1000); // 1-second delay
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const updateDisconnected = (disconnected) => {
            if (disconnected && !delayPassed) return;
            setIsDisconnected(disconnected);
        };

        const handleDisconnect = () => updateDisconnected(true);
        const handleConnect = () => setIsDisconnected(false);
        const handleReconnect = () => setIsDisconnected(false);
        const handleConnectError = () => updateDisconnected(true);

        // Network events
        const handleOffline = () => updateDisconnected(true);
        const handleOnline = () => {
            if (socket.connected) setIsDisconnected(false);
        };

        socket.on("disconnect", handleDisconnect);
        socket.on("connect", handleConnect);
        socket.on("reconnect", handleReconnect);
        socket.on("connect_error", handleConnectError);

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        // Initial state check
        if (!navigator.onLine || !socket.connected) {
            updateDisconnected(true);
        }

        return () => {
            socket.off("disconnect", handleDisconnect);
            socket.off("connect", handleConnect);
            socket.off("reconnect", handleReconnect);
            socket.off("connect_error", handleConnectError);

            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [delayPassed]);

    return isDisconnected;
}

export default useConnectionStatus;
