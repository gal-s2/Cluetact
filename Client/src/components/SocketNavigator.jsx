import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";

function SocketNavigator() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("im in useEffect", socket);
        socket.on(SOCKET_EVENTS.REDIRECT_TO_ROOM, ({ roomId }) => {
            const currentPath = location.pathname;
            const targetPath = `/game/${roomId}`;

            console.log("trying to get to room", roomId);

            // Prevent infinite redirect
            if (currentPath !== targetPath) {
                navigate(targetPath);
            }
        });

        return () => {
            socket.off(SOCKET_EVENTS.REDIRECT_TO_ROOM);
        };
    }, [navigate, location]);

    return null; // this component doesn't render anything
}

export default SocketNavigator;
