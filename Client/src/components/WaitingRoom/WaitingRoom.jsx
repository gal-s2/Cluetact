// /components/Game/WaitingRoom.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import socket from "../../socket";
import styles from "./WaitingRoom.module.css";
import { useUser } from "../UserContext";
import { useLocation } from "react-router-dom";

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
                socket.emit("leave_waiting_lobby", {
                    lobbyId: roomId,
                    username: savedUsername,
                });
            }
        };
    }, [roomId, savedUsername]);

    useEffect(() => {
        if (user && roomId) {
            console.log("Emitting join_waiting_lobby for user:", user.username);
            socket.emit("join_waiting_lobby", {
                lobbyId: roomId,
                username: user.username,
            });
        }
    }, [roomId, user]);

    useEffect(() => {
        const handleConnect = () => {
            if (user && roomId) {
                console.log("Socket reconnected, joining waiting room...");
                socket.emit("join_waiting_lobby", {
                    lobbyId: roomId,
                    username: user.username,
                });
            }
        };

        socket.on("connect", handleConnect);

        return () => {
            socket.off("connect", handleConnect);
        };
    }, [roomId, user]);

    useEffect(() => {
        const handleLobbyUpdate = (userList) => {
            console.log("Received lobby_update with users:", userList);
            setUsers(userList);
        };
        const handleGameStarted = ({ roomId }) => navigate(`/game/${roomId}`);

        socket.on("lobby_update", handleLobbyUpdate);
        socket.on("game_started", handleGameStarted);

        socket.emit("get_lobby_users", { lobbyId: roomId });

        return () => {
            socket.off("lobby_update", handleLobbyUpdate);
            socket.off("game_started", handleGameStarted);
        };
    }, []);

    const handleStart = () => {
        socket.emit("start_game_from_lobby", { lobbyId: roomId });
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
                    <QRCode
                        value={`${window.location.origin}/waiting/${roomId}`}
                        size={128}
                    />
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
                    <button
                        className={styles.startButton}
                        onClick={handleStart}
                    >
                        Start Game
                    </button>
                )}
            </div>
        </div>
    );
}

export default WaitingRoom;
