import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import styles from "./Lobby.module.css";
import AvatarPicker from "../Profile/AvatarPicker";

function generateRoomCode(length = 5) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function Lobby() {
    const { user, setUser, loading } = useUser();
    const navigate = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomCodeInput, setRoomCodeInput] = useState("");
    const [createdRoomCode, setCreatedRoomCode] = useState("");
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [playMenuOpen, setPlayMenuOpen] = useState(false);

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
            if (data.roomId) navigate(`/game/${data.roomId}`);
        };

        socket.on("new_room", handleNewRoom);

        return () => {
            socket.off("new_room", handleNewRoom);
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

        // 🔥 Properly wait for socket to disconnect
        await new Promise((resolve) => {
            if (socket.connected) {
                socket.once("disconnect", resolve);
                socket.disconnect();
            } else {
                resolve();
            }
        });

        socket.auth = {}; // clear auth
        setUser(null); // now cleanly set user to null
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
            <header className={styles.header}>
                <img
                    src="src/assets/Cluetact.jpeg"
                    alt="Cluetact Logo"
                    className={styles.logo}
                />
                <h1>Welcome, {user.username}!</h1>
            </header>

            <main className={styles.main}>
                <div className={styles.sectionGroup}>
                    {/* Play Section */}
                    <div className={styles.card}>
                        <button
                            className={styles.buttonPrimary}
                            onClick={() => setPlayMenuOpen((prev) => !prev)}
                        >
                            Play
                        </button>

                        {playMenuOpen && (
                            <div className={styles.dropdown}>
                                <button onClick={findGame}>Find Game</button>
                                <button onClick={() => setShowJoinModal(true)}>
                                    Join Room
                                </button>
                                <button onClick={handleCreateRoom}>
                                    Create Room
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Section */}
                    <div className={styles.card}>
                        <button
                            className={styles.buttonSecondary}
                            onClick={() => setProfileMenuOpen((prev) => !prev)}
                        >
                            My Profile
                        </button>

                        {profileMenuOpen && (
                            <div className={styles.dropdown}>
                                <button onClick={() => navigate("/stats")}>
                                    My Stats
                                </button>
                                <button onClick={() => navigate("/profile")}>
                                    View & Edit Details
                                </button>
                                <button
                                    className={styles.buttonDanger}
                                    onClick={disconnect}
                                >
                                    Disconnect
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showJoinModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Enter Room Code</h2>
                        <input
                            type="text"
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value)}
                            placeholder="e.g. ABCD1234"
                        />
                        <div className={styles.modalActions}>
                            <button
                                className={styles.buttonPrimary}
                                onClick={handleJoinRoom}
                            >
                                Join
                            </button>
                            <button
                                className={styles.buttonSecondary}
                                onClick={() => setShowJoinModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Room Created!</h2>
                        <p>
                            Pass-key: <strong>{createdRoomCode}</strong>
                        </p>
                        <button
                            className={styles.buttonPrimary}
                            onClick={() => setShowCreateModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Lobby;
