import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../UserContext';

function Lobby() {
    const socketRef = useRef(null);
    const { user } = useUser();

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
            socketRef.current.emit('join_game', { userId: user._id, username: user.username });
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