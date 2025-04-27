import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import styles from "./Lobby.module.css";
import AvatarPicker from "../Profile/AvatarPicker";
import axios from "axios";

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
        socket.disconnect();
        setUser(null);
        navigate("/");

        try {
            const response = await axios.post(
                "http://localhost:8000/auth/logout",
                { id: user._id }
            );
            console.log(response);
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
            <h3>Hello, {user.username}</h3>

            <div className={styles.sectionGroup}>
                {/* Play Section */}
                <div className={styles.playSection}>
                    <button
                        className={styles.blue}
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
                <div className={styles.profileSection}>
                    <button
                        className={styles.orange}
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
                            <button className={styles.red} onClick={disconnect}>
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Avatar Picker */}
            <AvatarPicker />

            {/* Join Modal */}
            {showJoinModal && (
                <div className={styles.modal}>
                    <h3>Enter Room Code</h3>
                    <input
                        type="text"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value)}
                        placeholder="ABCD1234"
                    />
                    <button onClick={handleJoinRoom}>Join</button>
                    <button onClick={() => setShowJoinModal(false)}>
                        Cancel
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className={styles.modal}>
                    <h3>Room Created</h3>
                    <p>
                        Pass-key: <strong>{createdRoomCode}</strong>
                    </p>
                    <button onClick={() => setShowCreateModal(false)}>
                        OK
                    </button>
                </div>
            )}
        </div>
    );
}

export default Lobby;
