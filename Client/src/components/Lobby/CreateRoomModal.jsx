import styles from "./Lobby.module.css";

function CreateRoomModal({ createdRoomCode, closeModal }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Room Created!</h2>
                <p>
                    Pass-key: <strong>{createdRoomCode}</strong>
                </p>
                <button className={styles.buttonPrimary} onClick={closeModal}>
                    OK
                </button>
            </div>
        </div>
    );
}

export default CreateRoomModal;
