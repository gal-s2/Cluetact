import { useEffect, useRef } from "react";
import { useGameRoom } from "@contexts/GameRoomContext";
import styles from "./CountdownTimer.module.css";

function CountdownTimer({ timeLeft, setTimeLeft, onComplete }) {
    const { gameState } = useGameRoom();
    const endTimeRef = useRef(null);
    const intervalRef = useRef(null);

    // Fixed: Use bracket notation for CSS module classes with hyphens
    const colorClass = gameState.status === "CLUE_SUBMISSION" ? styles["clue-submission-color"] : styles["race-color"];

    useEffect(() => {
        if (timeLeft === null) return;

        endTimeRef.current = Date.now() + timeLeft * 1000;

        intervalRef.current = setInterval(() => {
            const secondsLeft = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setTimeLeft(secondsLeft);

            if (secondsLeft === 0) {
                clearInterval(intervalRef.current);
                onComplete?.();
            }
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [timeLeft, onComplete]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return <div className={`${styles.countdownTimer} ${colorClass}`}>{formatTime(timeLeft ?? 0)}</div>;
}

export default CountdownTimer;
