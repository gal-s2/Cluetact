import Button from "../UI/Button/Button";
import Modal from "../UI/Modal/Modal";
import styles from "./Lobby.module.css";

function JoinRoomModal({ roomCodeInput, setRoomCodeInput, handleJoinRoom, closeModal }) {
    return (
        <Modal onClose={closeModal}>
            <div className={styles.modalContent}>
                <h2>Enter Room Code</h2>
                <input type="text" value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value)} placeholder="e.g. ABCD1234" />
                <div className={styles.modalActions}>
                    <Button color="light-blue" disabled={roomCodeInput.trim().length === 0} onClick={handleJoinRoom}>
                        Join
                    </Button>
                    <Button color="light-green" onClick={closeModal}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default JoinRoomModal;
