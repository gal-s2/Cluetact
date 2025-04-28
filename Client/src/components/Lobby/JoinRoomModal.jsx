import styles from "./Lobby.module.css";

function JoinRoomModal({ roomCodeInput, setRoomCodeInput, handleJoinRoom, closeModal }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Enter Room Code</h2>
                <input type="text" value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value)} placeholder="e.g. ABCD1234" />
                <div className={styles.modalActions}>
                    <button className={styles.buttonPrimary} onClick={handleJoinRoom}>
                        Join
                    </button>
                    <button className={styles.buttonSecondary} onClick={closeModal}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JoinRoomModal;
