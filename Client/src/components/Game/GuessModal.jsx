// src/components/GuessModal.jsx
import { useState } from "react";
import styles from "./GuessModal.module.css";

function GuessModal({ clue, onSubmit, onCancel }) {
    const [guess, setGuess] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (guess.trim()) {
            onSubmit(guess.trim(), clue);
            setGuess("");
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3>Guess the word for:</h3>
                <p className={styles.definition}>"{clue.definition}"</p>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Your guess..." value={guess} onChange={(e) => setGuess(e.target.value)} className={styles.input} autoFocus />
                    <div className={styles.buttons}>
                        <button type="submit">Submit</button>
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GuessModal;
