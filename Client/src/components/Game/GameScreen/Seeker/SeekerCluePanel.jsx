// GameScreen/Seeker/SeekerCluePanel.jsx
import { useEffect, useRef } from "react";
import { useGameRoom } from "../../../../contexts/GameRoomContext";
import { useUser } from "../../../../contexts/UserContext";
import GuessActionLine from "./GuessActionLine";
import GuessStream from "../Shared/GuessStream";
import ClueBubble from "../Shared/ClueBubble";
import styles from "./SeekerCluePanel.module.css";
function SeekerCluePanel() {
    const { gameState } = useGameRoom();
    const { user } = useUser();

    const { clues, guesses, activeClue, isSubmittingClue, clueGiverUsername } = gameState;
    const lastClue = clues[clues.length - 1];
    const validActiveClue = lastClue?.active && !lastClue.blocked ? lastClue : null;
    const historyClues = validActiveClue ? clues.slice(0, -1) : clues;

    const historyListRef = useRef(null);

    useEffect(() => {
        if (historyListRef.current) {
            historyListRef.current.scrollTop = historyListRef.current.scrollHeight;
        }
    }, [historyClues]);

    const shouldShowGuessBox = !!validActiveClue && user.username !== clueGiverUsername;

    return (
        <div className={styles.clueSection}>
            <h3 className={styles.heading}>Active Clue</h3>
            {validActiveClue ? (
                <div className={styles.activeClueWrapper}>
                    <ClueBubble from={validActiveClue.from} definition={validActiveClue.definition} blocked={validActiveClue.blocked} invalid={validActiveClue.invalid} word="" />
                </div>
            ) : (
                <p className={styles.emptyMessage}>No active clue.</p>
            )}

            {shouldShowGuessBox && <GuessActionLine />}

            {validActiveClue && (
                <>
                    <h3 className={styles.heading}>Live Guesses</h3>
                    <GuessStream guesses={guesses} />
                </>
            )}

            <h3 className={styles.heading}>Blocked Clues</h3>
            {historyClues.length === 0 ? (
                <p className={styles.emptyMessage}>No history yet.</p>
            ) : (
                <div ref={historyListRef} className={styles.scrollableHistoryList} data-clue-count={historyClues.length}>
                    {historyClues.map((clue) => (
                        <ClueBubble key={clue.id} from={clue.from} definition={clue.definition} blocked={clue.blocked} invalid={clue.invalid} word={clue.word} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SeekerCluePanel;
