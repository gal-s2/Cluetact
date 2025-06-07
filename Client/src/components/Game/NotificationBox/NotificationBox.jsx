import { useEffect, useState } from "react";
import styles from "./NotificationBox.module.css";
import { useGameRoom } from "../../../contexts/GameRoomContext";

function NotificationBox() {
    const [showText, setShowText] = useState(false);
    const { notification, setNotification } = useGameRoom();
    const message = notification.message;
    const type = notification.type || "notification";
    const onDone = () => {
        setNotification({ message: "", type: "notification" });
    };

    useEffect(() => {
        if (message) {
            setShowText(true);
            const fadeTimer = setTimeout(() => setShowText(false), 4000); // start fade after 4s
            const doneTimer = setTimeout(() => onDone && onDone(), 5000); // clear after 5s
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(doneTimer);
            };
        } else {
            // If message is empty, immediately hide
            setShowText(false);
        }
    }, [message, onDone]);

    // Don't render anything if there's no message
    if (!message) {
        return null;
    }

    return (
        <div className={`${styles.notificationBox} ${styles[type]}`}>
            <span className={showText ? styles.visible : styles.hidden}>{message}</span>
        </div>
    );
}

export default NotificationBox;
