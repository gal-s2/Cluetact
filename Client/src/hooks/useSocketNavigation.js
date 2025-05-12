import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";

export default function useSocketNavigation() {
    const navigate = useNavigate();
    const locatiobn = useLocation();

    useEffect(() => {
        const handleRedirectToLobby = () => {
            navigate("/lobby");
        };
        const handleRedirectToRoom = ({ roomId }) => {
            const currentPath = location.pathname;
            const targetPath = `game/${roomId}`;

            if (currentPath != targetPath) navigate(targetPath);
        };

        const handleRedirectToLogin = () => {
            navigate("/login");
        };

        socket.on(SOCKET_EVENTS.REDIRECT_TO_LOBBY, handleRedirectToLobby);
        socket.on(SOCKET_EVENTS.REDIRECT_TO_LOGIN, handleRedirectToLogin);
        socket.on(SOCKET_EVENTS.REDIRECT_TO_ROOM, handleRedirectToRoom);

        return () => {
            socket.off(SOCKET_EVENTS.REDIRECT_TO_LOBBY, handleRedirectToLobby);
            socket.off(SOCKET_EVENTS.REDIRECT_TO_LOGIN, handleRedirectToLogin);
            socket.off(SOCKET_EVENTS.REDIRECT_TO_ROOM, handleRedirectToRoom);
        };
    }, [navigate, location]);
}
