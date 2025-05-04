import { io } from "socket.io-client";

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

socket.on("connect", () => {
    console.log("[Client] Connected successfully with socket id:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message);
});

socket.on("disconnect", () => {
    console.log("A socket has passed away");
});

socket.on("redirect_to_login", () => {
    console.log("[Client] Redirecting to the login...");
    window.location.href = "/login";
});

export default socket;
