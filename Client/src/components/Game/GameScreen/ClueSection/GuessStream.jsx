import { useEffect, useState } from "react";
import styles from "./GuessStream.module.css";

function GuessStream({ guesses }) {
    const [displayedGuesses, setDisplayedGuesses] = useState([]);

    useEffect(() => {
        // If guesses array is smaller than displayed (like after refresh/reset)
        if (guesses.length < displayedGuesses.length) {
            setDisplayedGuesses(guesses);
        } else if (guesses.length > displayedGuesses.length) {
            const newGuesses = guesses.slice(displayedGuesses.length);
            setDisplayedGuesses((prev) => [...prev, ...newGuesses]);
        }
    }, [guesses]);

    return (
        <div className={styles.guessStreamContainer}>
            {displayedGuesses.map((guess, index) => (
                <div key={index} className={styles.guessBubble}>
                    <span className={styles.guessUser}>{guess.from}:</span> {guess.word}
                </div>
            ))}
        </div>
    );
}

export default GuessStream;
