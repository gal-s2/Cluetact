import styles from "./KeeperWordPopup.module.css";
import socket from "../../../services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useGameRoom } from "@contexts/GameRoomContext";
import Modal from "@common/Modal/Modal";
import Button from "@common/Button/Button";

function KeeperWordPopup({ showConfirmModal }) {
    const { gameState, setKeeperWord } = useGameRoom();
    const keeperWord = gameState.keeperWord || "";
    const logMessage = gameState.logMessage;

    const handleSubmit = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_KEEPER_WORD_SUBMISSION, { word: keeperWord });
    };

    return (
        <Modal onClose={() => showConfirmModal()} showCloseButton={true}>
            <div className={styles.container}>
                <p>{logMessage}</p>
                <input type="text" value={keeperWord} onChange={(e) => setKeeperWord(e.target.value)} placeholder="Enter your secret word" />
                <Button color="accept" onClick={handleSubmit} disabled={!keeperWord || keeperWord.trim() === ""}>
                    Submit
                </Button>
            </div>
        </Modal>
    );
}

export default KeeperWordPopup;
