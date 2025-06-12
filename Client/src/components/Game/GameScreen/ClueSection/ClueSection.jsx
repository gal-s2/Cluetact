import React, { useEffect, useRef } from "react";
import ClueBubble from "../Seeker/ClueBubble";
import styles from "./ClueSection.module.css";
import GuessStream from "./GuessStream";
import GuessActionLine from "../Seeker/GuessActionLine";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function ClueSection() {
    const { gameState } = useGameRoom();
    const { clues, guesses } = gameState;

    const lastClue = clues[clues.length - 1];
    const activeClue = lastClue?.active && !lastClue.blocked ? lastClue : null;
    const historyClues = activeClue ? clues.slice(0, clues.length - 1) : clues;

    const historyListRef = useRef(null);

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
                <div className={styles.activeClueWrapper}>
                    <ClueBubble key={activeClue.id} from={activeClue.from} definition={activeClue.definition} blocked={activeClue.blocked} invalid={activeClue.invalid} word={""} />
                </div>
            ) : (
                <p className={styles.emptyMessage}>No active clue.</p>
            )}

            {/* Submit Guess Section */}
            {!gameState.isKeeper && !gameState.isSubmittingClue && gameState.activeClue && <GuessActionLine />}

            {/* People's Guesses - Only show when there's an active clue */}
            {activeClue && (
                <>
                    <h3 className={styles.heading}>People's Guesses</h3>
                    <GuessStream guesses={guesses} />
                </>
            )}

            {/* History Clues */}
            <h3 className={styles.heading}>Blocked Clues</h3>
            {historyClues.length === 0 ? (
                <p className={styles.emptyMessage}>No history yet.</p>
            ) : (
                <div ref={historyListRef} className={styles.scrollableHistoryList} data-clue-count={historyClues.length}>
                    {historyClues.map((clue) => (
                        <ClueBubble key={clue.id} from={clue.from} definition={clue.definition} blocked={clue.blocked} invalid={clue.invalid} word={""} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClueSection;
