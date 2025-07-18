import { useEffect, useState, useRef } from "react";

function CountdownTimer({ duration, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const endTimeRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        endTimeRef.current = Date.now() + duration * 1000;
        setTimeLeft(duration);

        intervalRef.current = setInterval(() => {
            const secondsLeft = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setTimeLeft(secondsLeft);

            if (secondsLeft === 0) {
                clearInterval(intervalRef.current);
                onComplete?.();
            }
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [duration, onComplete]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#dc2626" }}>{formatTime(timeLeft)}</div>;
}

export default CountdownTimer;
