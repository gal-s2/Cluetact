import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function Lobby() {
    const socketRef = useRef(null);

    useEffect(() => {
        // Create socket connection once
        socketRef.current = io('http://localhost:8000'); // your server URL
  
        return () => {
            // Clean up on unmount
            socketRef.current.disconnect();
        };
    }, []);

    const findGame = () => {
        if (socketRef.current) {
            socketRef.current.emit('join game');
            console.log('Join game message sent');
        }
    }

    return (
        <>
            <button onClick={findGame}>Find Game</button>
            <button>Join Room</button>
        </>
    );
}

export default Lobby;