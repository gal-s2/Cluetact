import { useEffect, useState, useRef } from "react";
import styles from "./GuessStream.module.css";

function GuessStream({ guesses = [] }) {
    const [displayedGuesses, setDisplayedGuesses] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const validGuesses = guesses || [];

        // Sync all guesses if a new game or refresh happened
        if (validGuesses.length !== displayedGuesses.length || JSON.stringify(validGuesses) !== JSON.stringify(displayedGuesses)) {
            setDisplayedGuesses([...validGuesses].reverse());
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
