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
    console.log("Im a disconnecting socket!");
});

socket.on("redirect_to_login", () => {
    console.log("[Client] Redirecting to the lobby...");
    // Handle the redirection logic
    // For example, redirecting the user to the lobby page:
    window.location.href = "/login"; // Or use React Router's history.push("/lobby") if you're using React Router
});

export default socket;
