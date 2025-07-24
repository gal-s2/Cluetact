import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import styles from "./GameRoom.module.css";

function ExitGameButton({ onExit }) {
    return (
        <button className={styles.exitButton} onClick={onExit} title="Exit Game">
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </button>
    );
}

export default ExitGameButton;
