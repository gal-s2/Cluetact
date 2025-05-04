import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import styles from "./Lobby.module.css";
import LobbyHeader from "./LobbyHeader";
import JoinRoomModal from "./JoinRoomModal";
import CreateRoomModal from "./CreateRoomModal";
import ProfileCard from "./ProfileCard";
import PlayCard from "./PlayCard";
import generateRoomCode from "../../utils/generateRoomCode";

function Lobby() {
    const { user, setUser, loading } = useUser();
    const navigate = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomCodeInput, setRoomCodeInput] = useState("");
    const [createdRoomCode, setCreatedRoomCode] = useState("");
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [playMenuOpen, setPlayMenuOpen] = useState(false);
    const [inQueue, setInQueue] = useState(false);

    useEffect(() => {
        if (!user && !loading) {
            navigate("/login");
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

        socket.on("new_room", handleNewRoom);
        socket.on("entered_queue", handleInQueue);

        return () => {
            socket.off("new_room", handleNewRoom);
            socket.off("entered_queue");
        };
    }, [navigate]);

    const findGame = () => {
        if (!user) return;
        socket.emit("find_game", { userId: user._id, username: user.username });
    };

    const disconnect = async () => {
        if (!user) return;

        try {
            await axios.post("http://localhost:8000/auth/logout", {
                id: user._id,
            });
            console.log("Logout successful");
        } catch (error) {
            console.log("Error in disconnect", error);
        }

        await new Promise((resolve) => {
            if (socket.connected) {
                socket.once("disconnect", resolve);
                socket.disconnect();
            } else {
                resolve();
            }
        });

        socket.auth = {};
        setUser(null);
    };

    const handleCreateRoom = () => {
        if (!user) return;

        const newCode = generateRoomCode();
        setCreatedRoomCode(newCode);
        setShowCreateModal(true);

        socket.emit("create_waiting_lobby", {
            lobbyId: newCode,
            username: user.username,
        });

        navigate(`/waiting/${newCode}`, { state: { isCreator: true } });
    };

    const handleJoinRoom = () => {
        if (!user) return;

        socket.emit("join_waiting_lobby", {
            lobbyId: roomCodeInput,
            username: user.username,
        });

        navigate(`/waiting/${roomCodeInput}`);
    };

    return (
        <div className={styles.container}>
            <LobbyHeader username={user.username} />

            {inQueue ? (
                <div className={styles.queueLoading}>
                    <span className={styles.typingDots}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <p>Searching for a game</p>
                </div>
            ) : (
                <main className={styles.main}>
                    <div className={styles.sectionGroup}>
                        <PlayCard playMenuOpen={playMenuOpen} setPlayMenuOpen={setPlayMenuOpen} findGame={findGame} setShowJoinModal={setShowJoinModal} handleCreateRoom={handleCreateRoom} />
                        <ProfileCard profileMenuOpen={profileMenuOpen} setProfileMenuOpen={setProfileMenuOpen} navigate={navigate} disconnect={disconnect} />
                    </div>
                </main>
            )}

            {showJoinModal && <JoinRoomModal roomCodeInput={roomCodeInput} setRoomCodeInput={setRoomCodeInput} handleJoinRoom={handleJoinRoom} closeModal={() => setShowJoinModal(false)} />}

            {showCreateModal && <CreateRoomModal createdRoomCode={createdRoomCode} closeModal={() => setShowCreateModal(false)} />}
        </div>
    );
}

export default Lobby;
