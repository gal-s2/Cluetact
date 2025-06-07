import React, { useEffect, useRef } from "react";
import ClueBubble from "../Seeker/ClueBubble";
import styles from "./ClueSection.module.css"; // adjust to your styling needs
import GuessStream from "./GuessStream"; // adjust import if needed
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function ClueSection() {
    const { gameState } = useGameRoom();
    const { clues, guesses } = gameState;

    const activeClue = clues.length > 0 && clues[clues.length - 1].active ? clues[clues.length - 1] : null;
    const historyClues = clues.slice(0, clues.length - 1);
    const historyListRef = useRef(null);

    // Auto-scroll to bottom when new history clues are added
    useEffect(() => {
        if (historyListRef.current) {
            historyListRef.current.scrollTop = historyListRef.current.scrollHeight;
        }
    }, [historyClues]);

    return (
        <div className={styles.clueSection}>
            {/* Active Clue */}
            <h3 className={styles.heading}>Active Clue</h3>
            {activeClue ? (
                <div>
                    <div className={styles.activeClueWrapper}>
                        <ClueBubble
                            key={activeClue.id}
                            from={activeClue.from}
                            definition={activeClue.definition}
                            blocked={activeClue.blocked}
                            invalid={activeClue.invalid}
                            word={""} // adjust if needed
                        />
                    </div>
                    <h4 className={styles.guessHeader}>People's Guesses</h4>
                    {/* Guess Stream */}
                    <GuessStream guesses={guesses} />
                </div>
            ) : (
                <p className={styles.emptyMessage}>No active clue.</p>
            )}

            {/* History Clues */}
            <h3 className={styles.heading}>History</h3>
            {historyClues.length === 0 ? (
                <p className={styles.emptyMessage}>No history yet.</p>
            ) : (
                <div ref={historyListRef} className={styles.scrollableHistoryList} data-clue-count={historyClues.length}>
                    {historyClues.map((clue) => (
                        <ClueBubble
                            key={clue.id}
                            from={clue.from}
                            definition={clue.definition}
                            blocked={clue.blocked}
                            invalid={clue.invalid}
                            word={""} // adjust if needed
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClueSection;
