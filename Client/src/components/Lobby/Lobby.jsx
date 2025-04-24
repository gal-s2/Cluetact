import { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import styles from "./Lobby.module.css";
import AvatarPicker from "../Profile/AvatarPicker";
import axios from "axios";

function Lobby() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [playMenuOpen, setPlayMenuOpen] = useState(false);

    useEffect(() => {
        socket.on("new_room", (data) => {
            if (data.roomId) navigate(`/game/${data.roomId}`);
        });

        return () => {
            socket.off("new_room");
        };
    }, []);

    const findGame = () => {
        socket.emit("find_game", { userId: user._id, username: user.username });
    };

    const disconnect = async () => {
        const currentUser = user;
        socket.disconnect();

        try {
            await axios.post("http://localhost:8000/auth/logout", {
                id: currentUser._id,
            });
        } catch (error) {
            console.log("Error in disconnect");
        }

        setUser(null);
        navigate("/");
    };

    return (
        <div className={styles.container}>
            <h3>Hello, {user.username}</h3>

            <div className={styles.sectionGroup}>
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
                            <button disabled>Join Room</button>
                        </div>
                    )}
                </div>

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

                            <button onClick={disconnect}>Disconnect</button>
                        </div>
                    )}
                </div>
            </div>

            <AvatarPicker />
        </div>
    );
}

export default Lobby;
