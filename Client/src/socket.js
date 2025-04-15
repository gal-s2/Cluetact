import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

// Log everything received from server
socket.onAny((event, ...args) => {
  console.log(`[Client] Received event: ${event} | Data:`, args);
});

socket.on('welcome', (data) => {
  console.log('Received welcome:', data.message);
});

export default socket;