import { useState } from "react";
import styles from "./GuessActionLine.module.css";

function GuessActionLine({ selectedClue, onSubmit }) {
    const [guess, setGuess] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (guess.trim() && selectedClue) {
            onSubmit(guess.trim(), selectedClue);
            setGuess("");
        }
    };

    return (
        <div className={styles.actionLine}>
            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputSection}>
                        <input
                            type="text"
                            placeholder={selectedClue ? "Type your guess here..." : "Waiting for a clue..."}
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            className={styles.input}
                            disabled={!selectedClue}
                            autoFocus={selectedClue}
                        />

                        {selectedClue && (
                            <div className={styles.selectedClueInfo}>
                                <span className={styles.selectedLabel}>Current Clue:</span>
                                <span className={styles.selectedClue}>"{selectedClue.definition}"</span>
                                <span className={styles.clueFrom}>from {selectedClue.from}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.actionSection}>
                        <button type="submit" className={styles.guessButton} disabled={!guess.trim() || !selectedClue}>
                            Submit Guess
                        </button>
                    </div>
                </form>

                {!selectedClue && <p className={styles.instruction}>Waiting for a clue to be shared...</p>}
            </div>
        </div>
    );
}

export default GuessActionLine;
