// /components/Game/WaitingRoom.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import socket from "../../socket";
import styles from "./WaitingRoom.module.css";
import { useUser } from "../UserContext";
import { useLocation } from "react-router-dom";
import SOCKET_EVENTS from "@shared/socketEvents.json";

function WaitingRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [users, setUsers] = useState([]);
    const [copied, setCopied] = useState(false);
    const [savedUsername, setSavedUsername] = useState("");
    const location = useLocation();
    const isCreator = location.state?.isCreator || false;

    useEffect(() => {
        if (user?.username) {
            setSavedUsername(user.username);
        }
    }, [user]);

    useEffect(() => {
        return () => {
            if (savedUsername) {
                console.log(`Leaving room ${roomId} as ${savedUsername}`);
                socket.emit(SOCKET_EVENTS.LEAVE_WAITING_LOBBY, {
                    lobbyId: roomId,
                    username: savedUsername,
                });
            }
        };
    }, [roomId, savedUsername]);

    useEffect(() => {
        const handleConnect = () => {
            console.log("Connected, now joining waiting lobby...");
            if (user && roomId) {
                socket.emit(SOCKET_EVENTS.JOIN_WAITING_LOBBY, {
                    lobbyId: roomId,
                    username: user.username,
                });

                console.log(socket);
            }
        };

        const handleLobbyUpdate = (users) => {
            console.log("Received lobby update:", users);
            setUsers(users);
        };

        socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
            console.error("Socket connect error:", error.message);
        });

        socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
        socket.on(SOCKET_EVENTS.LOBBY_UPDATE, handleLobbyUpdate);

        if (!socket.connected && socket.disconnected) {
            socket.connect();
        } else {
            // If already connected (fast refresh?), emit immediately
            handleConnect();
        }

        return () => {
            socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
            socket.off(SOCKET_EVENTS.LOBBY_UPDATE, handleLobbyUpdate);
        };
    }, [roomId, user]);

    useEffect(() => {
        const handleError = (message) => {
            alert(message);
        };

        socket.on(SOCKET_EVENTS.ERROR_MESSAGE, handleError);

        return () => {
            socket.off(SOCKET_EVENTS.ERROR_MESSAGE, handleError);
        };
    }, []);

    useEffect(() => {
        const handleRedirectToLobby = () => {
            navigate("/lobby");
        };

        socket.on(SOCKET_EVENTS.REDIRECT_TO_LOBBY, handleRedirectToLobby);

        return () => {
            socket.off(SOCKET_EVENTS.REDIRECT_TO_LOBBY, handleRedirectToLobby);
        };
    }, []);

    useEffect(() => {
        const handleGameStarted = ({ roomId }) => navigate(`/game/${roomId}`);

        socket.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);

        socket.emit(SOCKET_EVENTS.GAME_STARTED, { lobbyId: roomId });

        return () => {
            socket.off("game_started", handleGameStarted);
        };
    }, []);

    const handleStart = () => {
        socket.emit(SOCKET_EVENTS.START_GAME_FROM_LOBBY, { lobbyId: roomId });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(roomId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <h2 className={styles.heading}>Waiting Room</h2>
                <p className={styles.passKey}>
                    Pass-key: <strong>{roomId}</strong>
                    <button onClick={handleCopy} className={styles.copyButton}>
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </p>

                <div className={styles.qrContainer}>
                    <QRCode value={`${window.location.origin}/waiting/${roomId}`} size={128} />
                    <p className={styles.qrLabel}>Scan to Join</p>
                </div>

                <h4>Current Players:</h4>
                <ul className={styles.userList}>
                    {users.map((username) => (
                        <li key={username}>
                            <span className={styles.greenDot}></span> {username}
                        </li>
                    ))}
                </ul>

                {user && user.username === users[0] && users.length >= 3 && (
                    <button className={styles.startButton} onClick={handleStart}>
                        Start Game
                    </button>
                )}
            </div>
        </div>
    );
}

export default WaitingRoom;
