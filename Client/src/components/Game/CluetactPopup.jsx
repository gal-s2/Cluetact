import { useEffect, useState } from "react";
import styles from "./CluetactPopup.module.css";

function CluetactPopup({ word, guesser, onClose }) {
    const [secondsLeft, setSecondsLeft] = useState(3);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            onClose();
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [onClose]);

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <h2>🧠 Cluetact Achieved!</h2>
                <p>
                    <strong>{guesser}</strong> guessed the word{" "}
                    <strong>{word}</strong>!
                </p>
                <p>Next letter is being revealed... ({secondsLeft})</p>
            </div>
        </div>
    );
}

export default CluetactPopup;
