import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
    auth: {
        token: localStorage.getItem("token")
    }
});

// Log everything received from server
socket.onAny((event, ...args) => {
  console.log(`[Client] Received event: ${event} | Data:`, args);
});

export default socket;