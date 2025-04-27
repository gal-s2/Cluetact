import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const socket = io("http://localhost:8000", {
    autoConnect: false, // ⛔ don't connect immediately
    auth: {
        token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Log every message received from server
socket.onAny((event, ...args) => {
    console.log(`[Client] Received event: ${event} | Data:`, args);
});

socket.onAny((event, ...args) => {
    console.log(`[Client] Received event: ${event} | Data:`, args);
});

socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message);
});

export default socket;
