// src/components/SeekerClueSection.jsx
import ClueBubble from "./ClueBubble";
import styles from "./SeekerClueSection.module.css";

function SeekerClueSection({ clues, onGuess }) {
    return (
        <div className={styles.clueSection}>
            {clues.map((clue) => (
                <ClueBubble key={clue.id} id={clue.id} from={clue.from} definition={clue.definition} blocked={clue.blocked} onGuess={() => onGuess(clue)} />
            ))}
        </div>
    );
}

export default SeekerClueSection;
