import axios from "axios";
import baseUrl from "@config/baseUrl";
import { useState } from "react";
import { useUser } from "@contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useGlobalNotification } from "@contexts/GlobalNotificationContext";
import socket from "@services/socket";
import styles from "./Lobby.module.css";
import LobbyHeader from "./LobbyHeader";
import JoinRoomModal from "./JoinRoomModal";
import ProfileCard from "./ProfileCard";
import PlayCard from "./PlayCard";
import generateRoomCode from "../../utils/generateRoomCode";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import Modal from "@common/Modal/Modal";
import InfoSection from "./InfoSection";
import { useEffect } from "react";
import { useMusic } from "@components/Music/MusicContext.jsx";

function Lobby() {
    const { user, setUser, loading } = useUser();
    const navigate = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [roomCodeInput, setRoomCodeInput] = useState("");
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [playMenuOpen, setPlayMenuOpen] = useState(false);
    const [inQueue, setInQueue] = useState(false);
    const { setGlobalNotification } = useGlobalNotification();
    const { changeTrack, currentTrack } = useMusic();

    useEffect(() => {
        console.log("Lobby: Requesting lobby track");
        changeTrack("lobby");
    }, [changeTrack]);

    if (!user && !loading) {
        console.log("No user found in Lobby.jsx, skipping render.");
        return null;
    }

    useEffect(() => {
        if (!user && !loading) {
            navigate("/");
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    useEffect(() => {
        const handleNewRoom = (data) => {
            if (data.roomId) {
                setInQueue(false);
                navigate(`/game/${data.roomId}`);
            }
        };

        const handleInQueue = () => {
            setInQueue(true);
        };

        socket.on(SOCKET_EVENTS.SERVER_NEW_ROOM, handleNewRoom);
        socket.on(SOCKET_EVENTS.SERVER_ENTERED_QUEUE, handleInQueue);

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_NEW_ROOM, handleNewRoom);
            socket.off(SOCKET_EVENTS.SERVER_ENTERED_QUEUE);
        };
    }, [navigate]);

    const handlePlayMenuToggle = () => {
        setPlayMenuOpen((prev) => !prev);
        if (profileMenuOpen) setProfileMenuOpen(false);
    };

    const handleProfileMenuToggle = () => {
        setProfileMenuOpen((prev) => !prev);
        if (playMenuOpen) setPlayMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.${styles.card}`)) {
                setPlayMenuOpen(false);
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const findGame = () => {
        if (!user) return;
        socket.emit(SOCKET_EVENTS.CLIENT_FIND_GAME, {
            userId: user._id,
            username: user.username,
        });
        setPlayMenuOpen(false);
    };

    const leaveQueue = () => {
        if (!user) return;
        socket.emit(SOCKET_EVENTS.CLIENT_LEAVE_QUEUE);
        setInQueue(false);
    };

    const disconnect = async () => {
        console.log("Disconnect function called");
        if (!user) {
            console.log("No user found, skipping disconnect.");
            return;
        }

        console.log("Starting logout call with user:", user);

        try {
            const response = await axios.post(`${baseUrl}/auth/logout`, {
                id: user._id,
                username: user.username,
            });
            console.log("Logout successful", response.data);
        } catch (error) {
            console.log("Error in disconnect (axios POST logout):", error);
        }

        console.log("Preparing to disconnect socket...");
        if (socket.connected) {
            console.log("Socket is connected. Calling socket.disconnect()...");
            socket.disconnect();
            console.log("Socket.disconnect() called");
        } else {
            console.log("Socket is not connected, skipping socket.disconnect().");
        }

        console.log("Navigating to home page BEFORE clearing user state...");
        navigate("/", { replace: true });

        setTimeout(() => {
            console.log("Clearing socket.auth and user state...");
            socket.auth = {};
            setUser(null);
            console.log("User state cleared.");
        }, 0);
    };

    const handleCreateRoom = () => {
        if (!user) return;

        const newCode = generateRoomCode();
        setPlayMenuOpen(false);

        socket.emit(SOCKET_EVENTS.CLIENT_CREATE_WAITING_ROOM, {
            waitingRoomId: newCode,
            username: user.username,
        });

        navigate(`/waiting/${newCode}`, { state: { isCreator: true } });

        setGlobalNotification({
            message: "Waiting room created — invite friends! You can start once 3 or more players join.",
            type: "info",
        });
    };

    const handleJoinRoom = () => {
        if (!user) return;
        navigate(`/waiting/${roomCodeInput}`);
        setPlayMenuOpen(false);
    };

    const handleShowJoinModal = () => {
        setShowJoinModal(true);
        setPlayMenuOpen(false);
    };

    return (
        <div className={styles.container}>
            <LobbyHeader username={user.username} />

            {inQueue && (
                <Modal onClose={leaveQueue} showCloseButton={true}>
                    <div className={styles.queueLoading}>
                        <span className={styles.typingDots}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                        <p>Searching for a game</p>
                    </div>
                </Modal>
            )}

            <main className={styles.main}>
                <div className={styles.sectionGroup}>
                    <PlayCard playMenuOpen={playMenuOpen} setPlayMenuOpen={handlePlayMenuToggle} findGame={findGame} setShowJoinModal={handleShowJoinModal} handleCreateRoom={handleCreateRoom} />
                    <ProfileCard profileMenuOpen={profileMenuOpen} setProfileMenuOpen={handleProfileMenuToggle} navigate={navigate} disconnect={disconnect} />
                </div>
            </main>

            <InfoSection />

            {showJoinModal && <JoinRoomModal roomCodeInput={roomCodeInput} setRoomCodeInput={setRoomCodeInput} handleJoinRoom={handleJoinRoom} closeModal={() => setShowJoinModal(false)} />}
        </div>
    );
}

export default Lobby;
