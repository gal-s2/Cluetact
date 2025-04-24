import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import styles from "./Lobby.module.css";
import AvatarPicker from "../Profile/AvatarPicker";

function Lobby() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const [selectedAvatar, setSelectedAvatar] = useState(null);

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
        console.log("Disconnecting...");
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
            <div>
                <button className={styles.blue} onClick={findGame}>
                    Find Game
                </button>
                <button className={styles.green} disabled>
                    Join Room
                </button>
                <button onClick={() => navigate("/stats")}>My Stats</button>
                <button className={styles.red} onClick={disconnect}>
                    Disconnect
                </button>

                {selectedAvatar && (
                    <div className={styles.avatarDisplay}>
                        <img
                            src={selectedAvatar}
                            alt="Selected Avatar"
                            style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                marginTop: "10px",
                                border: "2px solid #444",
                            }}
                        />
                    </div>
                )}

                <h4>Select Your Avatar:</h4>
                <AvatarPicker onSelect={(src) => setSelectedAvatar(src)} />
            </div>
        </div>
    );
}

export default Lobby;
