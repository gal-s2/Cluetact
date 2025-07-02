import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import socket from "../../services/socket";
import styles from "./WaitingRoom.module.css";
import BackToLobbyButton from "../General/BackToLobbyButton";
import { useUser } from "../../contexts/UserContext";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { baseUrl } from "../../config/baseUrl";

function WaitingRoom() {
    const { roomId } = useParams();
    const { user } = useUser();
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [host, setHost] = useState("");
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const navigate = useNavigate();
    const hasJoinedRef = useRef(false);
    const isCreator = location.state?.isCreator || false;

    const isHost = user?.username === host;

    const sortedUsers = [...users].sort((a, b) => {
        if (a === host) return -1;
        if (b === host) return 1;
        return 0;
    });

    // Handle leaving the room
    const handleRoomLeave = () => {
        if (user?.username && roomId && hasJoinedRef.current) {
            console.log("Leaving waiting room:", roomId, user.username);
            socket.emit(SOCKET_EVENTS.CLIENT_LEAVE_WAITING_ROOM, {
                waitingRoomId: roomId,
                username: user.username,
            });
            hasJoinedRef.current = false;
        }
    };

    // Handle back button click
    const handleBackClick = () => {
        handleRoomLeave();
        navigate("/lobby");
    };

    // Handle browser navigation (back button, refresh, close tab)
    useEffect(() => {
        const handleBeforeUnload = () => {
            handleRoomLeave();
        };

        const handlePopState = () => {
            handleRoomLeave();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
            // Also leave room when component unmounts
            handleRoomLeave();
        };
    }, [user?.username, roomId]);

    useEffect(() => {
        if (!user?.username || !roomId) return;

        const handleWaitingRoomUpdate = ({ users, host }) => {
            console.log("Waiting room update received:", users, host);
            setUsers(users || []);
            setHost(host || "");
        };

        const handleServerReady = () => {
            if (!hasJoinedRef.current) {
                console.log("Server ready, joining waiting room:", roomId, user.username, "isCreator:", isCreator);

                if (isCreator) {
                    // If user created the room, they should already be in it from the lobby
                    // Just request the current state
                    socket.emit(SOCKET_EVENTS.CLIENT_GET_WAITING_ROOM_USERS, {
                        waitingRoomId: roomId,
                    });
                } else {
                    // If user is joining via link, emit join event
                    socket.emit(SOCKET_EVENTS.CLIENT_JOIN_WAITING_ROOM, {
                        waitingRoomId: roomId,
                        username: user.username,
                    });
                }

                hasJoinedRef.current = true;
                setIsJoined(true);
            }
        };

        const handleRedirectToRoom = ({ roomId: gameRoomId }) => {
            hasJoinedRef.current = false; // Don't send leave event when redirecting to game
            navigate(`/game/${gameRoomId}`);
        };

        // Attach listeners
        socket.on(SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE, handleWaitingRoomUpdate);
        socket.on(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS, handleServerReady);
        socket.on(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, handleRedirectToRoom);

        // Check if server is ready for events
        if (socket.connected) {
            socket.emit(SOCKET_EVENTS.CLIENT_CHECK_EVENTS_AVAILABILITY);
        } else {
            // If not connected, wait for connection
            const handleConnect = () => {
                socket.emit(SOCKET_EVENTS.CLIENT_CHECK_EVENTS_AVAILABILITY);
            };
            socket.on("connect", handleConnect);

            return () => {
                socket.off("connect", handleConnect);
            };
        }

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE, handleWaitingRoomUpdate);
            socket.off(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS, handleServerReady);
            socket.off(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, handleRedirectToRoom);
        };
    }, [roomId, user?.username, isCreator, navigate]);

    const handleStart = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_START_GAME_FROM_WAITING_ROOM, {
            waitingRoomId: roomId,
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/waiting/${roomId}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className={styles.backdrop}>
            <BackToLobbyButton onClick={handleBackClick} />
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
                        <li
                            key={username}
                            className={`
                                ${username === host ? styles.hostItem : ""}
                                ${username === user?.username ? styles.currentUser : ""}
                            `}
                        >
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
