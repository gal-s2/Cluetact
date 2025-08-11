import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { useMusic } from "../../Music/MusicContext.jsx";
import styles from "./MusicToggleButton.module.css";

function MusicToggleButton() {
    const { isMusicOn, toggleMusic } = useMusic();
    return (
        <button
            className={`${styles.musicButton} ${
                isMusicOn ? styles.on : styles.off
            }`}
            onClick={toggleMusic}
            title={isMusicOn ? "Turn Music Off" : "Turn Music On"}
            aria-label={isMusicOn ? "Turn Music Off" : "Turn Music On"}
        >
            <FontAwesomeIcon icon={isMusicOn ? faVolumeHigh : faVolumeXmark} />
        </button>
    );
}

export default MusicToggleButton;
