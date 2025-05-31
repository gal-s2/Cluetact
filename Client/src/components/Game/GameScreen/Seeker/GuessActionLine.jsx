import { useState } from "react";
import styles from "./GuessActionLine.module.css";

function GuessActionLine({ selectedClue, onSubmit, onClearSelection }) {
    const [guess, setGuess] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (guess.trim() && selectedClue) {
            onSubmit(guess.trim(), selectedClue);
            setGuess("");
        }
    };

    const handleClear = () => {
        onClearSelection();
        setGuess("");
    };

    return (
        <div className={styles.actionLine}>
            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputSection}>
                        <input type="text" placeholder="Type your guess here..." value={guess} onChange={(e) => setGuess(e.target.value)} className={styles.input} disabled={!selectedClue} />
                        {selectedClue && (
                            <div className={styles.selectedClueInfo}>
                                <span className={styles.selectedLabel}>Selected:</span>
                                <span className={styles.selectedClue}>"{selectedClue.definition}"</span>
                                <button type="button" onClick={handleClear} className={styles.clearButton} title="Clear selection">
                                    ×
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.actionSection}>
                        <button type="submit" className={styles.guessButton} disabled={!guess.trim() || !selectedClue}>
                            Guess
                        </button>
                    </div>
                </form>

                {!selectedClue && <p className={styles.instruction}>Click on a clue above to select it, then type your guess</p>}
            </div>
        </div>
    );
}

export default GuessActionLine;
