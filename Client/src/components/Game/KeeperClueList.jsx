import { useState } from "react";
import socket from "../../socket";
import styles from "./KeeperClueList.module.css";
import SOCKET_EVENTS from "@shared/socketEvents.json";

function KeeperClueList({ clues }) {
    const [guess, setGuess] = useState("");

    const handleSubmit = () => {
        if (guess.trim()) {
            socket.emit(SOCKET_EVENTS.TRY_BLOCK_CLUE, { guess: guess.trim() });
            setGuess("");
        }
    };

    const unblockedClues = clues.filter((clue) => !clue.blocked);
    const blockedClues = clues.filter((clue) => clue.blocked);

    return (
        <div className={styles.keeperContainer}>
            <h4 className={styles.heading}>Incoming Clues</h4>
            <ul className={styles.clueList}>
                {unblockedClues.length === 0 ? (
                    <li className={styles.emptyItem}>No new clues yet.</li>
                ) : (
                    unblockedClues.map((clue, index) => (
                        <li key={index} className={styles.clueItem}>
                            <strong>{clue.from}:</strong> {clue.definition}
                        </li>
                    ))
                )}
            </ul>

            {unblockedClues.length > 0 && (
                <div className={styles.inputRow}>
                    <input type="text" placeholder="Try to block a clue..." value={guess} onChange={(e) => setGuess(e.target.value)} className={styles.guessInput} />
                    <button onClick={handleSubmit} className={styles.blockButton}>
                        Block
                    </button>
                </div>
            )}

            {blockedClues.length > 0 && (
                <>
                    <h4 className={styles.subHeading}>Blocked Clues</h4>
                    <ul className={styles.blockedList}>
                        {blockedClues.map((clue, index) => (
                            <li key={index} className={styles.blockedItem}>
                                <span className={styles.blockedWord}>{clue.word?.toUpperCase() || "?"}</span>
                                <span className={styles.blockedDefinition}>{clue.definition}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default KeeperClueList;
