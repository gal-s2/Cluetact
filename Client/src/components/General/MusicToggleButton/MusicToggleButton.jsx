import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./MusicToggleButton.module.css";

function MusicToggleButton({ isMusicOn, onToggle }) {
    return (
        <button className={`${styles.musicButton} ${isMusicOn ? styles.on : styles.off}`} onClick={onToggle} title={isMusicOn ? "Turn Music Off" : "Turn Music On"}>
            <FontAwesomeIcon icon={isMusicOn ? faVolumeHigh : faVolumeXmark} />
        </button>
    );
}

export default MusicToggleButton;
