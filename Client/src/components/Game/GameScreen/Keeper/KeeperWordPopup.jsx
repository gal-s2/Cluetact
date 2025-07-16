import styles from "./KeeperWordPopup.module.css";
import socket from "../../../../services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function KeeperWordPopup({ showConfirmModal }) {
    const { gameState, setKeeperWord } = useGameRoom();
    const keeperWord = gameState.keeperWord || "";
    const logMessage = gameState.logMessage;

    const handleSubmit = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_KEEPER_WORD_SUBMISSION, { word: keeperWord });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <button className={styles.closeButton} onClick={() => showConfirmModal()}>
                    &times;
                </button>
                <p>{logMessage}</p>
                <input type="text" value={keeperWord} onChange={(e) => setKeeperWord(e.target.value)} placeholder="Enter your secret word" />
                <button onClick={handleSubmit} disabled={!keeperWord || keeperWord.trim() === ""}>
                    Submit
                </button>
            </div>
        </div>
    );
}

export default KeeperWordPopup;
