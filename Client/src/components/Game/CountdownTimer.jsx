import { useEffect, useState, useRef } from "react";
import styles from "./GameRoom.module.css";

function CountdownTimer({ timeLeft, setTimeLeft, onComplete }) {
    const endTimeRef = useRef(null);
    const intervalRef = useRef(null);

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

    return <div className={styles.countdownTimer}>{formatTime(timeLeft ?? 0)}</div>;
}

export default CountdownTimer;
