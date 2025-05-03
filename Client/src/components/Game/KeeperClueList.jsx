import { useState } from "react";
import socket from "../../socket";
import styles from "./KeeperClueList.module.css"; // you can create this next

function KeeperClueList({ clues }) {
    const [guess, setGuess] = useState("");

    const handleSubmit = () => {
        if (guess.trim()) {
            socket.emit("submit_guess", { guess: guess.trim() });
            setGuess("");
        }
    };

    const unblockedClues = clues.filter((clue) => !clue.blocked);

    return (
        <div className={styles.keeperContainer}>
            <h4>Incoming Clues</h4>
            <ul className={styles.clueList}>
                {unblockedClues.map((clue) => (
                    <li key={clue.id} className={styles.clueItem}>
                        <strong>{clue.from}:</strong> {clue.definition}
                    </li>
                ))}
            </ul>

            {unblockedClues.length > 0 && (
                <div className={styles.inputRow}>
                    <input
                        type="text"
                        placeholder="Try to block a clue..."
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className={styles.guessInput}
                    />
                    <button
                        onClick={handleSubmit}
                        className={styles.blockButton}
                    >
                        Block
                    </button>
                </div>
            )}
        </div>
    );
}

export default KeeperClueList;
