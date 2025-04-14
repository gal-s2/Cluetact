import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import styles from './Lobby.module.css';

function Lobby() {
    const socketRef = useRef(null);
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Create socket connection once
        socketRef.current = io('http://localhost:8000');
  
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

    const disconnect = () => {
        console.log(socketRef.current);
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        setUser(null);
        navigate('/')
    }

    return (
        <>
            <button className={styles.blue} onClick={findGame}>Find Game</button>
            <button className={styles.green}>Join Room</button>
            <button className={styles.red} onClick={disconnect}>Disconnect</button>
        </>
    );
}

export default Lobby;