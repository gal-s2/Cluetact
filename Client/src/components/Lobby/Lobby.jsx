import axios from "axios";
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

    const disconnect = async () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        setUser(null);
        navigate('/');

        console.log(user)

        try {
            const response = await axios.post("http://localhost:8000/auth/logout", { id: user._id });
            console.log(response);
        } catch (error) {
            console.log('Error in disconnect');
        }
    }

    return (
        <div className={styles.container}>
            <h3>Hello, {user.username}</h3>
            <div>
                <button className={styles.blue} onClick={findGame}>Find Game</button>
                <button className={styles.green}>Join Room</button>
                <button className={styles.red} onClick={disconnect}>Disconnect</button>
            </div>
        </div>
    );
}

export default Lobby;