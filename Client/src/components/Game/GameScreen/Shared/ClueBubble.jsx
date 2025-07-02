import { useUser } from "../../../../contexts/UserContext";
import styles from "./ClueBubble.module.css";

function ClueBubble({ from, definition, word, blocked, onGuess, selected = false }) {
    const { user } = useUser();
    const isMyClue = user && user.username === from;

    return (
        <div className={`${styles.bubble} ${blocked ? styles.blocked : ""} ${selected ? styles.selected : ""} ${isMyClue ? styles.myClue : ""}`} onClick={!blocked ? onGuess : undefined}>
            {selected && !blocked && <span className={styles.selectedIcon}>✓</span>}
            <strong>{isMyClue ? "(ME)" : `${from}:`}</strong>{" "}
            {blocked ? (
                <div className={styles.blockedContent}>
                    <span className={styles.blockedWord}>{word.toUpperCase()}</span>
                    <div className={styles.definition}>{definition}</div>
                </div>
            ) : (
                <>{definition}</>
            )}
        </div>
    );
}

export default ClueBubble;
