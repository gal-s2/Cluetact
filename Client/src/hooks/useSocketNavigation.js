import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";

export default function useSocketNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        socket.emit(SOCKET_EVENTS.CLIENT_NOTIFY_MY_SOCKET_IS_READY);

        const handleRedirectToLobby = () => {
            navigate("/lobby");
        };

        const handleRedirectToRoom = ({ roomId }) => {
            const currentPath = location.pathname;
            const targetPath = `/game/${roomId}`;
            console.log(currentPath);
            console.log(targetPath);
            const condition = currentPath != targetPath;
            if (condition) {
                console.log("condition is true");
                navigate(targetPath);
            } else {
                console.log("condition is false");
            }
        };

        const handleRedirectToLogin = () => {
            navigate("/login");
        };

        socket.on(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, handleRedirectToLobby);
        socket.on(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOGIN, handleRedirectToLogin);
        socket.on(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, handleRedirectToRoom);

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, handleRedirectToLobby);
            socket.off(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOGIN, handleRedirectToLogin);
            socket.off(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, handleRedirectToRoom);
        };
    }, [navigate, location]);
}
