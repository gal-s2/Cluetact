import { io } from "socket.io-client";
import SOCKET_EVENTS from "@shared/socketEvents.json";

const token = localStorage.getItem("token");

const socket = io("http://localhost:8000", {
    auth: {
        token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// !!! DEBUG ONLY !!!
window.socket = socket;

// Log every message received from server
socket.onAny((event, ...args) => {
    console.log(`[Client] Received event: ${event} | Data:`, args);
});

socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log("[Client] Connected successfully with socket id:", socket.id);
});

socket.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
    console.error("Socket connect error:", err.message);
});

socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log("A socket has passed away");
});

socket.on(SOCKET_EVENTS.REDIRECT_TO_LOGIN, () => {
    console.log("[Client] Redirecting to the login...");
    window.location.href = "/login";
});

export default socket;
