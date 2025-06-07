import { useState, useEffect, useRef } from "react";
import socket from "../../../../services/socket";
import styles from "./KeeperClueList.module.css";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function KeeperClueList({ maxVisibleItems = 4 }) {
    const { gameState } = useGameRoom();
    const clues = gameState.clues || [];

    const [guess, setGuess] = useState("");
    const [showBlocked, setShowBlocked] = useState(true);
    const unblockedListRef = useRef(null);
    const blockedListRef = useRef(null);

    const handleSubmit = () => {
        if (guess.trim()) {
            socket.emit(SOCKET_EVENTS.CLIENT_TRY_BLOCK_CLUE, { guess: guess.trim() });
            setGuess("");
        }
    };

    const unblockedClues = clues.filter((clue) => !clue.blocked);
    const blockedClues = clues.filter((clue) => clue.blocked);

    // Set CSS custom properties for dynamic height calculation
    useEffect(() => {
        if (unblockedListRef.current) {
            unblockedListRef.current.style.setProperty("--max-visible-items", maxVisibleItems);
        }
        if (blockedListRef.current) {
            blockedListRef.current.style.setProperty("--max-visible-items", maxVisibleItems);
        }
    }, [maxVisibleItems]);

    // Auto-scroll to bottom when new clues arrive
    useEffect(() => {
        if (unblockedListRef.current) {
            unblockedListRef.current.scrollTop = unblockedListRef.current.scrollHeight;
        }
    }, [unblockedClues]);

    return (
        <div className={styles.keeperContainer}>
            <div className={styles.incomingSection}>
                <h4 className={styles.heading}>Incoming Clues</h4>
                {unblockedClues.length === 0 ? (
                    <p className={styles.emptyMessage}>No new clues yet.</p>
                ) : (
                    <div ref={unblockedListRef} className={styles.scrollableClueList} data-clue-count={unblockedClues.length}>
                        {unblockedClues.map((clue, index) => (
                            <div key={index} className={styles.clueItem}>
                                <strong>{clue.from}:</strong> {clue.definition}
                            </div>
                        ))}
                    </div>
                )}
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
        </div>
    );
}

export default KeeperClueList;
