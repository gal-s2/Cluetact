import { useEffect, useState } from "react";
import styles from "./CluetactPopup.module.css";
import { useGameRoom } from "../../../contexts/GameRoomContext";

function CluetactPopup() {
    const [secondsLeft, setSecondsLeft] = useState(5);
    const { gameState, setCluetact } = useGameRoom();
    const word = gameState.cluetact?.word || "";
    const guesser = gameState.cluetact?.guesser || "";

    // Check if the word will be fully revealed after this cluetact
    const isWordFullyRevealed = gameState.isWordComplete;

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            setCluetact(null);
        }, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className={styles.overlay}>
            <div className={`${styles.popup} ${isWordFullyRevealed ? styles.finalReveal : ""}`}>
                <h2>{isWordFullyRevealed ? "🎉 WORD FULLY REVEALED!" : "🧠 Cluetact Achieved!"}</h2>
                <p>
                    <strong>{guesser}</strong> guessed the word <strong>{word}</strong>!
                </p>

                {isWordFullyRevealed ? (
                    <div className={styles.finalRevealSection}>
                        <p className={styles.finalWordDisplay}>
                            The complete word is: <span className={styles.finalWord}>{gameState.revealedWord}</span>
                        </p>
                        <p className={styles.gameEndMessage}>🏆 Game Complete! ({secondsLeft})</p>
                    </div>
                ) : (
                    <p>Next letter is being revealed... ({secondsLeft})</p>
                )}
            </div>
        </div>
    );
}

export default CluetactPopup;
