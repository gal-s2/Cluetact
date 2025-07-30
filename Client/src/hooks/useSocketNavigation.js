import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useGlobalNotification } from "@contexts/GlobalNotificationContext";

export default function useSocketNavigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setGlobalNotification } = useGlobalNotification();

    useEffect(() => {
        console.log("[Socket Navigation] Initializing socket navigation");
        socket.emit(SOCKET_EVENTS.CLIENT_NOTIFY_MY_SOCKET_IS_READY);

        const handleRedirect = (targetPath) => {
            const currentPath = location.pathname;

            if (currentPath !== targetPath) {
                navigate(targetPath);
            }
        };

        const handleRedirectToLobby = () => {
            handleRedirect("/lobby");
        };

        const handleRedirectToRoom = ({ roomId }) => {
            const targetPath = `/game/${roomId}`;
            handleRedirect(targetPath);
        };

        const handleRedirectToLogin = () => {
            localStorage.clear();
            handleRedirect("/");
        };

        const handleErrorMessage = (message) => {
            setGlobalNotification({
                type: "error",
                message,
            });
        };

        socket.on(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, handleRedirectToLobby);
        socket.on(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOGIN, handleRedirectToLogin);
        socket.on(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, handleRedirectToRoom);
        socket.on(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, handleErrorMessage);

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, handleRedirectToLobby);
            socket.off(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOGIN, handleRedirectToLogin);
            socket.off(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, handleRedirectToRoom);
        };
    }, [location.pathname]);
}
