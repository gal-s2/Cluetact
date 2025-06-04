import { useEffect, useState } from "react";
import { useUser } from "..//../contexts/UserContext";
import socket from "../../services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Overwatch.module.css";

function Overwatch() {
    const { user, loading } = useUser();
    const navigate = useNavigate();

    const [onlineRooms, setOnlineRooms] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [secondsLeft, setSecondsLeft] = useState(10);

    useEffect(() => {
        if (!user && !loading) {
            navigate("/");
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return null;
    }

    const handleGetOnlineRooms = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_GET_ONLINE_ROOMS, null);
    };

    const handleGetAllUsers = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_GET_ALL_USERS, {});
    };

    useEffect(() => {
        const handleOnlineRooms = (data) => {
            if (data) {
                setOnlineRooms(Object.values(data));
            }
        };

        const handleAllUsers = (data) => {
            if (data) {
                setAllUsers(Object.entries(data));
            }
        };

        socket.on(SOCKET_EVENTS.SERVER_POST_ONLINE_ROOMS, handleOnlineRooms);
        socket.on(SOCKET_EVENTS.SERVER_POST_ALL_USERS, handleAllUsers);

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_POST_ONLINE_ROOMS, handleOnlineRooms);
            socket.off(SOCKET_EVENTS.SERVER_POST_ALL_USERS, handleAllUsers);
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        // Poll data every 10 seconds
        const pollInterval = setInterval(() => {
            socket.emit(SOCKET_EVENTS.CLIENT_GET_ONLINE_ROOMS, null);
            socket.emit(SOCKET_EVENTS.CLIENT_GET_ALL_USERS, null);
            setSecondsLeft(10); // reset countdown
        }, 10000);

        // Countdown timer every second
        const timerInterval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 10));
        }, 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(timerInterval);
        };
    }, [user]);

    return (
        <div className={styles.container}>
            <h2>Overwatch Dashboard</h2>
            <p>Next update in: {secondsLeft} seconds</p>
            <div className={styles.buttonGroup}>
                <button onClick={handleGetOnlineRooms}>Get All Online Rooms</button>
                <button onClick={handleGetAllUsers}>Get All Users</button>
            </div>

            <div className={styles.dataSection}>
                <h3>Online Rooms</h3>
                {onlineRooms.length > 0 ? (
                    <ul>
                        {onlineRooms.map((room) => (
                            <li key={room.roomId}>
                                Room ID: {room.roomId}, Players: {room.players.map((p) => p.username).join(", ")}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No rooms online</p>
                )}

                <h3>All Users</h3>
                {allUsers.length > 0 ? (
                    <ul>
                        {allUsers.map(([username, socketId]) => (
                            <li key={username}>
                                Username: {username}, Socket ID: {socketId}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users found</p>
                )}
            </div>
        </div>
    );
}

export default Overwatch;
