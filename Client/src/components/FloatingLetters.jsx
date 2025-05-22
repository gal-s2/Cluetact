import { useEffect, useState } from "react";
import styles from "./FloatingLetters.module.css";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const createLetter = () => ({
    id: crypto.randomUUID(),
    char: LETTERS[Math.floor(Math.random() * LETTERS.length)],
    left: Math.random() * 100, // % across the screen
    size: 14 + Math.random() * 10, // px
    hue: Math.floor(Math.random() * 360), // for rainbow colors
    animation: `float-${Math.floor(Math.random() * 3) + 1}`, // random float direction
    duration: 4, // seconds
});

function FloatingLetters() {
    const [letters, setLetters] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newLetters = Array.from({ length: 8 }, () => createLetter());
            setLetters((prev) => [...prev, ...newLetters]);
            // Clean up old letters
            setTimeout(() => {
                setLetters((prev) => prev.slice(8));
            }, 5000);
        }, 4000); // frequency

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.floatingContainer}>
            {letters.map((letter) => (
                <span
                    key={letter.id}
                    className={`${styles.letter} ${styles[letter.animation]}`}
                    style={{
                        left: `${letter.left}%`,
                        fontSize: `${letter.size}px`,
                        color: `hsl(${letter.hue}, 70%, 60%)`,
                        animationDuration: `${letter.duration}s`,
                    }}
                >
                    {letter.char}
                </span>
            ))}
        </div>
    );
}

export default FloatingLetters;
