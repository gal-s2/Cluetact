import { useEffect, useState } from "react";
import { useUser } from "@contexts/UserContext";
import socket from "@services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useNavigate } from "react-router-dom";
import styles from "./Overwatch.module.css";

function Overwatch() {
    const { user, loading } = useUser();
    const navigate = useNavigate();

    const [onlineRooms, setOnlineRooms] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [waitingRooms, setWaitingRooms] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(30);

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

    const handleDataRefresh = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_GET_ONLINE_ROOMS, {});
        socket.emit(SOCKET_EVENTS.CLIENT_GET_ALL_USERS, {});
        socket.emit(SOCKET_EVENTS.CLIENT_GET_ONLINE_WAITING_ROOMS, {});
    };

    useEffect(() => {
        const handleOnlineRooms = (data) => {
            if (data) {
                setOnlineRooms(Object.values(data));
            }
        };

        const handleOnlineWaitingRooms = (data) => {
            if (data) {
                setWaitingRooms(data);
            }
        };

        const handleAllUsers = (data) => {
            if (data) {
                setAllUsers(Object.entries(data));
            }
        };

        socket.on(SOCKET_EVENTS.SERVER_POST_ONLINE_ROOMS, handleOnlineRooms);
        socket.on(SOCKET_EVENTS.SERVER_POST_ONLINE_WAITING_ROOMS, handleOnlineWaitingRooms);
        socket.on(SOCKET_EVENTS.SERVER_POST_ALL_USERS, handleAllUsers);

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_POST_ONLINE_ROOMS, handleOnlineRooms);
            socket.off(SOCKET_EVENTS.SERVER_POST_ONLINE_WAITING_ROOMS, handleOnlineWaitingRooms);
            socket.off(SOCKET_EVENTS.SERVER_POST_ALL_USERS, handleAllUsers);
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        handleDataRefresh();

        // Poll data every 10 seconds
        const pollInterval = setInterval(() => {
            socket.emit(SOCKET_EVENTS.CLIENT_GET_ONLINE_ROOMS, null);
            socket.emit(SOCKET_EVENTS.CLIENT_GET_ONLINE_WAITING_ROOMS, null);
            socket.emit(SOCKET_EVENTS.CLIENT_GET_ALL_USERS, null);
            setSecondsLeft(30); // reset countdown
        }, 30000);

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
                <button onClick={handleDataRefresh}>Refresh Data</button>
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
                <h3>Waiting Rooms</h3>
                {Object.keys(waitingRooms).length > 0 ? (
                    <ul>
                        {Object.entries(waitingRooms).map(([roomId, roomData]) => (
                            <li key={roomId} className={styles.waitingRoom}>
                                <div>
                                    <span>Room ID:</span> {roomId}
                                </div>
                                <div>
                                    <span>Host:</span> {roomData.host}
                                </div>
                                <div>
                                    <span>Users:</span> {[...roomData.users].join(", ") || "No users"}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No waiting rooms</p>
                )}
            </div>
        </div>
    );
}

export default Overwatch;
