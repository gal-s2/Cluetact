import axios from "axios";
import { useEffect } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import styles from "./Lobby.module.css";

function Lobby() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("new_room", (data) => {
            if (data.roomId) navigate(`/game/${data.roomId}`);
        });

        return () => {
            socket.off("new_room");
        };
    }, []);

    const findGame = () => {
        console.log(socket);
        socket.emit("find_game", { userId: user._id, username: user.username });
    };

    const disconnect = async () => {
        console.log("Disconnecting...");
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
            console.log("Error in disconnect");
        }
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

                {/* <button
                    className={styles.orange}
                    onClick={() => navigate("/stats")}
                >
                    My Stats
                </button> */}
                <button className={styles.red} onClick={disconnect}>
                    Disconnect
                </button>
            </div>
        </div>
    );
}

export default Lobby;
