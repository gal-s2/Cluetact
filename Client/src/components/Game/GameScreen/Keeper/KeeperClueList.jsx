import { useState } from "react";
import socket from "../../../../services/socket";
import styles from "./KeeperClueList.module.css";
import SOCKET_EVENTS from "@shared/socketEvents.json";

function KeeperClueList({ clues }) {
    const [guess, setGuess] = useState("");

    const handleSubmit = () => {
        if (guess.trim()) {
            socket.emit(SOCKET_EVENTS.CLIENT_TRY_BLOCK_CLUE, { guess: guess.trim() });
            setGuess("");
        }
    };

    const unblockedClues = clues.filter((clue) => !clue.blocked);
    const blockedClues = clues.filter((clue) => clue.blocked);

    return (
        <div className={styles.keeperContainer}>
            <div className={styles.incomingSection}>
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
                        <input
                            type="text"
                            placeholder="Try to block a clue..."
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (!guess.trim()) return;
                                    handleSubmit();
                                }
                            }}
                            className={styles.guessInput}
                        />
                        <button onClick={handleSubmit} className={styles.blockButton} disabled={!guess.trim()}>
                            Block
                        </button>
                    </div>
                )}
            </div>

            {blockedClues.length > 0 && (
                <div className={styles.blockedSection}>
                    <h4 className={styles.subHeading}>Blocked Clues</h4>
                    <ul className={styles.blockedList}>
                        {blockedClues.map((clue, index) => (
                            <li key={index} className={styles.blockedClueItem}>
                                <span className={styles.blockedWord}>{clue.word?.toUpperCase() || "?"}</span>
                                <span className={styles.blockedDefinition}>{clue.definition}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default KeeperClueList;
