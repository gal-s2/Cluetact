import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
    autoConnect: false, // ⛔ don't connect immediately
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Log every message received from server
socket.onAny((event, ...args) => {
    console.log(`[Client] Received event: ${event} | Data:`, args);
});

export default socket;
