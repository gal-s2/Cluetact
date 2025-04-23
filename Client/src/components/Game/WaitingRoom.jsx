// /components/Game/WaitingRoom.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import socket from "../../socket";
import styles from "./WaitingRoom.module.css";
import { useUser } from "../UserContext";

export default function WaitingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    socket.emit("join_waiting_lobby", { lobbyId: roomId, username: user.username });

    socket.on("lobby_update", (userList) => {
      setUsers(userList);
    });

    socket.on("game_started", ({ roomId }) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off("lobby_update");
      socket.off("game_started");
    };
  }, [roomId, user.username]);

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
        <p className={styles.passKey}>Pass-key: <strong>{roomId}</strong>
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
          {users.map((username) => (
            <li key={username}>
              <span className={styles.greenDot}></span> {username}
            </li>
          ))}
        </ul>

        {user.username === users[0] && users.length >= 3 && (
          <button className={styles.startButton} onClick={handleStart}>
            Start Game
          </button>
        )}
      </div>
    </div>
  );
}