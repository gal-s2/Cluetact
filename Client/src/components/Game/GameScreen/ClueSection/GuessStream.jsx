import { useEffect, useState, useRef } from "react";
import styles from "./GuessStream.module.css";

function GuessStream({ guesses = [] }) {
    const [displayedGuesses, setDisplayedGuesses] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        // Handle case where guesses might be undefined or null
        const validGuesses = guesses || [];

        // If guesses array is smaller than displayed (like after refresh/reset)
        if (validGuesses.length < displayedGuesses.length) {
            setDisplayedGuesses(validGuesses);
        } else if (validGuesses.length > displayedGuesses.length) {
            const newGuesses = validGuesses.slice(displayedGuesses.length);
            setDisplayedGuesses((prev) => [...newGuesses, ...prev]); // Add new guesses to the beginning
        }
    }, [guesses]);

    // Scroll to top when new guesses are added
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [displayedGuesses.length]);

    return (
        <div className={styles.guessStreamContainer} ref={containerRef}>
            {displayedGuesses.map((guess, index) => (
                <div key={`${guess.from}-${guess.word}-${index}`} className={styles.guessBubble}>
                    <span className={styles.guessUser}>{guess.from}:</span> {guess.word}
                </div>
            ))}
        </div>
    );
}

export default GuessStream;
