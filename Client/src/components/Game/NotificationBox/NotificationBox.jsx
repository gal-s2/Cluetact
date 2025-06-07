import { useEffect, useState } from "react";
import styles from "./NotificationBox.module.css";
import { useGameRoom } from "../../../contexts/GameRoomContext";

function NotificationBox() {
    const [showText, setShowText] = useState(false);
    const { notification, setNotification } = useGameRoom();
    const message = notification.message;
    const type = notification.type || "notification";

    useEffect(() => {
        if (message) {
            setShowText(true);
            const fadeTimer = setTimeout(() => setShowText(false), 4000);
            const doneTimer = setTimeout(() => {
                setNotification({ message: "", type: "notification" });
            }, 5000);
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(doneTimer);
            };
        } else {
            // If message is empty, immediately hide
            setShowText(false);
        }
    }, [message]);

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
