import styles from "./KeeperWordPopup.module.css";
import socket from "../../../../services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useState } from "react";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function KeeperWordPopup() {
    const [showConfirm, setShowConfirm] = useState(false);
    const { gameState, setKeeperWord } = useGameRoom();
    const keeperWord = gameState.keeperWord || "";
    const logMessage = gameState.logMessage;
    const handleSubmit = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_KEEPER_WORD_SUBMISSION, { word: keeperWord });
    };

    const handleQuit = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_LEAVE_ROOM);
        window.location.href = "/lobby";
    };

    return (
        <>
            <div className={styles.overlay}>
                <div className={styles.popup}>
                    <button className={styles.closeButton} onClick={() => setShowConfirm(true)}>
                        &times;
                    </button>
                    <p>{logMessage}</p>
                    <input type="text" value={keeperWord} onChange={(e) => setKeeperWord(e.target.value)} placeholder="Enter your secret word" />
                    <button onClick={handleSubmit} disabled={!keeperWord || keeperWord.trim() === ""}>
                        Submit
                    </button>
                </div>
            </div>

            {showConfirm && (
                <div className={styles.overlay}>
                    <div className={styles.confirmBox}>
                        <p>Are you sure you want to quit the room?</p>
                        <div className={styles.confirmButtons}>
                            <button onClick={handleQuit}>Yes</button>
                            <button onClick={() => setShowConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default KeeperWordPopup;
