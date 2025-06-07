import { useState } from "react";
import styles from "./GuessActionLine.module.css";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function GuessActionLine() {
    const [guess, setGuess] = useState("");
    const { handleGuessSubmit, gameState } = useGameRoom();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (guess.trim()) {
            handleGuessSubmit(guess.trim());
            setGuess("");
        }
    };

    return (
        <div className={styles.actionLine}>
            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputSection}>
                        <input type="text" placeholder="Type your guess here..." value={guess} onChange={(e) => setGuess(e.target.value)} className={styles.input} autoFocus />
                    </div>

                    <div className={styles.actionSection}>
                        <button type="submit" className={styles.guessButton} disabled={!guess.trim() | !gameState.activeClue}>
                            Submit Guess
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GuessActionLine;
