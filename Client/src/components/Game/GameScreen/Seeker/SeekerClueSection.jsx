import { useState } from "react";
import ClueBubble from "./ClueBubble";
import styles from "./SeekerClueSection.module.css";

function SeekerClueSection({ clues, onGuess }) {
    const activeClues = clues.filter((clue) => !clue.blocked);
    const blockedClues = clues.filter((clue) => clue.blocked);
    const [showBlocked, setShowBlocked] = useState(true);

    return (
        <div className={styles.clueSection}>
            <h3 className={styles.heading}>Clues in Play</h3>
            {activeClues.length === 0 ? <p className={styles.emptyMessage}>No active clues yet.</p> : activeClues.map((clue) => <ClueBubble key={clue.id} id={clue.id} from={clue.from} definition={clue.definition} blocked={clue.blocked} onGuess={() => onGuess(clue)} />)}

            {blockedClues.length > 0 && (
                <div className={styles.blockedSection}>
                    <div className={styles.blockedHeader} onClick={() => setShowBlocked((prev) => !prev)}>
                        <h4 className={styles.subHeading}>Blocked Clues</h4>
                        <span className={`${styles.toggleIcon} ${showBlocked ? styles.rotate : ""}`}>▼</span>
                    </div>
                    <div
                        style={{
                            maxHeight: showBlocked ? "1000px" : "0px",
                            opacity: showBlocked ? 1 : 0,
                            transition: "max-height 0.3s ease, opacity 0.3s ease",
                            overflow: "hidden",
                        }}
                    >
                        {blockedClues.map((clue) => (
                            <ClueBubble
                                key={clue.id}
                                id={clue.id}
                                from={clue.from}
                                definition={clue.definition}
                                word={clue.word} // 👈 add this
                                blocked={clue.blocked}
                                onGuess={() => {}}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SeekerClueSection;
