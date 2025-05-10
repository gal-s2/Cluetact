import ClueBubble from "./ClueBubble";
import styles from "./SeekerClueSection.module.css";

function SeekerClueSection({ clues, onGuess }) {
    return (
        <div className={styles.clueSection}>
            {clues.length === 0 ? (
                <p className={styles.emptyMessage}>No clues yet. Be the first to send one!</p>
            ) : (
                clues.map((clue) => <ClueBubble key={clue.id} id={clue.id} from={clue.from} definition={clue.definition} blocked={clue.blocked} onGuess={() => onGuess(clue)} />)
            )}
        </div>
    );
}

export default SeekerClueSection;
