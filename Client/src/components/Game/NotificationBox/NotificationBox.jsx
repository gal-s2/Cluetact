import { useEffect, useState } from "react";
import styles from "./NotificationBox.module.css";

function NotificationBox({ message, onDone }) {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        if (message) {
            setShowText(true);
            const fadeTimer = setTimeout(() => setShowText(false), 4000); // start fade after 9s
            const doneTimer = setTimeout(() => onDone && onDone(), 5000); // clear after 10s
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(doneTimer);
            };
        }
    }, [message, onDone]);

    return (
        <div className={styles.notificationBox}>
            <span className={showText ? styles.visible : styles.hidden}>{message}</span>
        </div>
    );
}

export default NotificationBox;
