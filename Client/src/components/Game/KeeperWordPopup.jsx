import styles from "./GameRoom.module.css";
import socket from "../../socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";

function KeeperWordPopup({ keeperWord, setKeeperWord, logMessage }) {
    const handleSubmit = () => {
        console.log(SOCKET_EVENTS);
        socket.emit(SOCKET_EVENTS.KEEPER_WORD_SUBMISSION, { word: keeperWord });
    };

    return (
        <>
            <div className={styles.overlay}></div>
            <div className={styles.keeperPopup}>
                <p>{logMessage}</p>
                <input type="text" value={keeperWord} onChange={(e) => setKeeperWord(e.target.value)} placeholder="Enter your secret word" />
                <button onClick={handleSubmit} disabled={keeperWord.trim() === ""}>
                    Submit
                </button>
            </div>
        </>
    );
}

export default KeeperWordPopup;
