import { useEffect, useState, useRef } from "react";
import { useUser } from "@contexts/UserContext";
import styles from "./GuessStream.module.css";

function GuessStream({ guesses = [] }) {
    const [displayedGuesses, setDisplayedGuesses] = useState([]);
    const containerRef = useRef(null);
    const { user } = useUser();

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

    const isMyGuess = (guessFrom) => {
        return user && user.username === guessFrom;
    };

    return (
        <div className={styles.guessStreamContainer} ref={containerRef}>
            {displayedGuesses.map((guess, index) => (
                <div key={`${guess.from}-${guess.word}-${index}`} className={`${styles.guessBubble} ${isMyGuess(guess.from) ? styles.myGuessBubble : ""}`}>
                    <span className={`${styles.guessUser} ${isMyGuess(guess.from) ? styles.myGuessUser : ""}`}>{isMyGuess(guess.from) ? "(ME)" : `${guess.from}:`}</span> {guess.word}
                </div>
            ))}
        </div>
    );
}

export default GuessStream;
