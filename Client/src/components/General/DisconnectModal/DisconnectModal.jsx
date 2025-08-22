import Modal from "@common/Modal/Modal";
import styles from "./DisconnectModal.module.css";

export default function DisconnectedModal() {
    return (
        <Modal>
            <div className={styles.container}>
                <h2 className={styles.title}>Connection Lost</h2>

                <p className={styles.message}>We're having trouble connecting to the game server. Don't worry - we're trying to reconnect automatically.</p>

                <div className={styles.spinnerWrapper}>
                    <div className={styles.spinner}></div>
                    <span className={styles.reconnectText}>Reconnecting...</span>
                </div>

                <div className={styles.tips}>
                    <small>Check your internet connection if this continues</small>
                </div>
                <div className={styles.refresh}>
                    <button onClick={() => window.location.reload()} className={styles.refreshButton}>
                        Refresh Page
                    </button>
                </div>
            </div>
        </Modal>
    );
}
