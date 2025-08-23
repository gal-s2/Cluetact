import Modal from "@common/Modal/Modal";
import styles from "./Lobby.module.css";
import image from "@assets/how_to_play.png";

function TutorialPopup({ onClose }) {
    return (
        <Modal onClose={onClose} className={styles.tutorialModal}>
            <img src={image} alt="How to Play" className={styles.tutorialImage} />
        </Modal>
    );
}

export default TutorialPopup;
