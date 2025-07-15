import { useState } from "react";
import styles from "./GameRoom.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Modal from "../UI/Modal/Modal";
import Button from "../UI/Button/Button";
import buttonStyles from "../UI/Button/Button.module.css";

function ExitGameButton({ onExit }) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleExitClick = () => setShowConfirmModal(true);
    const handleCloseModal = () => setShowConfirmModal(false);
    const handleConfirmExit = () => {
        setShowConfirmModal(false);
        onExit(); // call parent exit handler
    };

    return (
        <>
            <button className={styles.exitButton} onClick={handleExitClick} title="Exit Game">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>

            {showConfirmModal && (
                <Modal onClose={handleCloseModal}>
                    <div className={styles.modalContent}>
                        <h3>Are you sure you want to exit the game?</h3>
                        <div className={styles.buttonsContainer}>
                            <Button style="danger" onClick={handleConfirmExit}>
                                Yes
                            </Button>
                            <Button style="cancel" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default ExitGameButton;
