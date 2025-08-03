import { useEffect, useRef, useState } from "react";
import socket from "@services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useGameRoom } from "@contexts/GameRoomContext";
import { useUser } from "@contexts/UserContext";
import GuessStream from "../GameScreen/Shared/GuessStream";
import styles from "./KeeperCluePanel.module.css";

function KeeperCluePanel({ maxVisibleItems = 4 }) {
    const { gameState } = useGameRoom();
    const clues = gameState.clues || [];
    const { user } = useUser();
    const [guess, setGuess] = useState("");
    const unblockedClues = clues.filter((clue) => !clue.blocked);
    const blockedClues = clues.filter((clue) => clue.blocked);

    const unblockedListRef = useRef(null);
    const blockedListRef = useRef(null);

    useEffect(() => {
        if (unblockedListRef.current) {
            unblockedListRef.current.style.setProperty("--max-visible-items", maxVisibleItems);
            unblockedListRef.current.scrollTop = unblockedListRef.current.scrollHeight;
        }
        if (blockedListRef.current) {
            blockedListRef.current.style.setProperty("--max-visible-items", maxVisibleItems);
        }
    }, [unblockedClues]);

    const handleSubmit = () => {
        if (guess.trim()) {
            socket.emit(SOCKET_EVENTS.CLIENT_TRY_BLOCK_CLUE, { guess: guess.trim() });
            setGuess("");
        }
    };

    return (
        <div className={styles.keeperContainer}>
            {/* Unblocked clues section */}
            <div className={styles.incomingSection}>
                <h4 className={styles.heading}>Incoming Clue</h4>
                {unblockedClues.length === 0 ? (
                    <p className={styles.emptyMessage}>No active clue yet.</p>
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
                            placeholder="Try to block the active clue"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
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
                {gameState.activeClue && gameState.clueGiverUsername !== user.username && (
                    <>
                        <h4 className={styles.heading}>Live Guesses</h4>
                        <GuessStream guesses={gameState.guesses} />
                    </>
                )}
            </div>

            {/* Blocked clues section */}
            {/* {blockedClues.length > 0 && (
                <div className={styles.blockedSection}>
                    <h4 className={styles.subHeading}>Blocked Clues</h4>
                    <div ref={blockedListRef} className={styles.scrollableClueList}>
                        {blockedClues.map((clue, index) => (
                            <div key={index} className={styles.blockedClueItem}>
                                <div className={styles.blockedWord}>Blocked: {clue.word}</div>
                                <div className={styles.blockedDefinition}>{clue.definition}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default KeeperCluePanel;
