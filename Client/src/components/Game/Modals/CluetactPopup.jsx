import { useEffect, useState } from "react";
import styles from "./CluetactPopup.module.css";
import { useGameRoom } from "@contexts/GameRoomContext";

function CluetactPopup() {
    const [secondsLeft, setSecondsLeft] = useState(5);
    const { gameState, setCluetact } = useGameRoom();
    const { setKeeperWord } = useGameRoom();
    const word = gameState.cluetact?.word || "";
    const guesser = gameState.cluetact?.guesser || "";
    const isKeeper = gameState.isKeeper;

    // Check if the word will be fully revealed after this cluetact
    const isWordFullyRevealed = gameState.isWordComplete;

    // Check if the guessed word is actually the keeper word (more impressive!)
    const isDirectWordGuess = isWordFullyRevealed && word.toLowerCase() === gameState.keeperWord?.toLowerCase();

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            setCluetact(null);
            if (!isKeeper) setKeeperWord("");
        }, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    // Determine popup style and content based on the case
    const getPopupClass = () => {
        if (isDirectWordGuess) return `${styles.popup} ${styles.directWordGuess}`;
        if (isWordFullyRevealed) return `${styles.popup} ${styles.finalReveal}`;
        return styles.popup;
    };

    const getTitle = () => {
        if (isDirectWordGuess) return "🔥 DIRECT HIT!";
        if (isWordFullyRevealed) return "🎉 WORD FULLY REVEALED!";
        return "🧠 Cluetact Achieved!";
    };

    const getMainMessage = () => {
        if (isDirectWordGuess) {
            return (
                <p>
                    <strong>{guesser}</strong> guessed the entire word <strong>{word}</strong> directly!
                </p>
            );
        }
        return (
            <p>
                <strong>{guesser}</strong> guessed the word <strong>{word}</strong>!
            </p>
        );
    };

    return (
        <div className={styles.overlay}>
            <div className={getPopupClass()}>
                <h2>{getTitle()}</h2>
                {getMainMessage()}

                {isWordFullyRevealed ? (
                    <div className={styles.finalRevealSection}>
                        <p className={styles.finalWordDisplay}>
                            {isDirectWordGuess ? "Amazing guess! The word was:" : "The complete word is:"}
                            <span className={styles.finalWord}>{gameState.keeperWord}</span>
                        </p>
                        <p className={styles.gameEndMessage}>
                            {isDirectWordGuess ? "🚀 Incredible! Round Complete!" : "🏆 Round Complete!"} ({secondsLeft})
                        </p>
                    </div>
                ) : (
                    <p>Next letter is being revealed... ({secondsLeft})</p>
                )}
            </div>
        </div>
    );
}

export default CluetactPopup;
