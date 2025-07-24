import { useGlobalNotification } from "../../../contexts/GlobalNotificationContext";
import styles from "./GlobalNotificationBox.module.css";

function GlobalNotificationBox() {
    const { globalNotification, showText } = useGlobalNotification();
    const { message, type = "notification" } = globalNotification;

    if (!message) return null;

    return (
        <div className={`${styles.notificationBox} ${styles[type]}`}>
            <span className={showText ? styles.visible : styles.hidden}>{message}</span>
        </div>
    );
}

export default GlobalNotificationBox;
