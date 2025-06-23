import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import socket from "../../services/socket";
import styles from "./WaitingRoom.module.css";
import BackToLobbyButton from "../General/BackToLobbyButton";
import { useUser } from "../../contexts/UserContext";
import SOCKET_EVENTS from "@shared/socketEvents.json";

function WaitingRoom() {
    const { roomId } = useParams();
    const { user } = useUser();
    const [errorMessage, setErrorMessage] = useState("");

    const [users, setUsers] = useState([]);
    const [host, setHost] = useState("");
    const [copied, setCopied] = useState(false);
    const [savedUsername, setSavedUsername] = useState("");

    const isHost = user?.username === host;

    // Sort users so host is always first
    const sortedUsers = [...users].sort((a, b) => {
        if (a === host) return -1;
        if (b === host) return 1;
        return 0;
    });

    useEffect(() => {
        if (user?.username) {
            setSavedUsername(user.username);
        }
    }, [user]);

    useEffect(() => {
        return () => {
            if (savedUsername) {
                socket.emit(SOCKET_EVENTS.CLIENT_LEAVE_WAITING_ROOM, {
                    waitingRoomId: roomId,
                    username: savedUsername,
                });
            }
        };
    }, [roomId, savedUsername]);

    useEffect(() => {
        const handleConnect = () => {
            if (user?.username && roomId) {
                setTimeout(() => {
                    socket.emit(SOCKET_EVENTS.CLIENT_JOIN_WAITING_ROOM, {
                        waitingRoomId: roomId,
                        username: user.username,
                    });
                }, 100);
            }
        };

        const handleWaitingRoomUpdate = ({ users, host }) => {
            setUsers(users || []);
            setHost(host || "");
        };

        const handleDisconnect = (reason) => {
            // Handle disconnect if needed
        };

        // Set up all event listeners
        socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
            // Handle connection error if needed
        });

        socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
        socket.on(SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE, handleWaitingRoomUpdate);
        socket.on("disconnect", handleDisconnect);

        // Check current connection state
        if (!socket.connected) {
            socket.connect();
        } else {
            handleConnect();
        }

        return () => {
            socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
            socket.off(SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE, handleWaitingRoomUpdate);
            socket.off("disconnect", handleDisconnect);
        };
    }, [roomId, user]);

    // Separate effect to handle when user becomes available
    useEffect(() => {
        if (socket.connected && user?.username && roomId) {
            socket.emit(SOCKET_EVENTS.CLIENT_JOIN_WAITING_ROOM, {
                waitingRoomId: roomId,
                username: user.username,
            });
        }
    }, [user?.username, roomId]);

    useEffect(() => {
        const handleError = (message) => {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(""), 3000);
        };

        socket.on(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, handleError);

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, handleError);
        };
    }, []);

    const handleStart = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_START_GAME_FROM_WAITING_ROOM, {
            waitingRoomId: roomId,
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(roomId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className={styles.backdrop}>
            <BackToLobbyButton />
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
                    {sortedUsers.map((username) => (
                        <li key={username} className={`${username === host ? styles.hostItem : ""} ${username === user?.username ? styles.currentUser : ""}`}>
                            <span className={styles.greenDot}></span>
                            {username}
                            {username === host && <span className={styles.crownIcon}>👑</span>}
                            {username === user?.username && <span className={styles.meIndicator}>•</span>}
                        </li>
                    ))}
                </ul>

                {isHost && users.length >= 3 && (
                    <button className={styles.startButton} onClick={handleStart}>
                        Start Game
                    </button>
                )}
            </div>
            {errorMessage && <div className={styles.toast}>{errorMessage}</div>}
        </div>
    );
}

export default WaitingRoom;
