import Modal from "../UI/Modal/Modal";
import styles from "./Lobby.module.css";

function CreateRoomModal({ createdRoomCode, closeModal }) {
    return (
        <Modal onClose={closeModal}>
            <h2>Room Created!</h2>
            <p>
                Pass-key: <strong>{createdRoomCode}</strong>
            </p>
            <button className={styles.buttonPrimary} onClick={closeModal}>
                OK
            </button>
        </Modal>
    );
}

export default CreateRoomModal;
