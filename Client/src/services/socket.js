import { io } from "socket.io-client";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { baseUrl } from "../config/baseUrl";

const token = localStorage.getItem("token");
const socket = io(baseUrl, {
    autoConnect: false,
    auth: {
        token,
    },
    secure: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// !!! DEBUG ONLY !!!
window.socket = socket;

// Log every message received from server
socket.onAny((event, ...args) => {
    if (args[0] && args[0] != {}) console.log(`[Client] Received event: ${event} | Data:`, args);
    else console.log(`[Client] Received event: ${event}`);
});

socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log("[Client] Connected successfully with socket id:", socket.id);
});

socket.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
    console.log("Socket connect error:", err.message);
});

export default socket;
