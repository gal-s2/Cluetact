import { useEffect, useRef } from "react";
import { useGameRoom } from "@contexts/GameRoomContext";
import { useUser } from "@contexts/UserContext";
import GuessActionLine from "../GuessActionLine/GuessActionLine";
import GuessStream from "../GuessStream/GuessStream";
import ClueBubble from "../ClueBubble/ClueBubble";
import styles from "./SeekerCluePanel.module.css";

function SeekerCluePanel() {
    const { gameState } = useGameRoom();
    const { user } = useUser();

    const { clues, guesses, clueGiverUsername } = gameState;
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
        </div>
    );
}

export default SeekerCluePanel;
