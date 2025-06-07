import { useEffect, useState } from "react";
import styles from "./CluetactPopup.module.css";
import { useGameRoom } from "../../../contexts/GameRoomContext";

function CluetactPopup() {
    const [secondsLeft, setSecondsLeft] = useState(3);
    const { gameState, setCluetact } = useGameRoom();
    const word = gameState.cluetact?.word || "";
    const guesser = gameState.cluetact?.guesser || "";
    const onClose = () => {
        setCluetact(null);
    };

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
                    <strong>{guesser}</strong> guessed the word <strong>{word}</strong>!
                </p>
                <p>Next letter is being revealed... ({secondsLeft})</p>
            </div>
        </div>
    );
}

export default CluetactPopup;
