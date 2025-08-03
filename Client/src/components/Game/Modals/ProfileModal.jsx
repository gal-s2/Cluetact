import styles from "./ProfileModal.module.css";

export default function PlayerProfileModal({ selectedPlayer, onClose }) {
    if (!selectedPlayer) return null;

    return (
        <div className={styles.profileCard}>
            <button className={styles.closeButton} onClick={onClose}>
                &times;
            </button>
            <h2 className={styles.username}>{selectedPlayer.username}</h2>
            <div className={styles.country}>
                <img src="https://flagcdn.com/w40/us.png" srcSet="https://flagcdn.com/w80/us.png 2x" width="40" alt="us-flag" />
                <span>US</span>
            </div>
            <div className={styles.stats}>
                <p>
                    <strong>Wins:</strong> {selectedPlayer.wins || 0}
                </p>
                <p>
                    <strong>Total Games:</strong> {selectedPlayer.totalGames || 0}
                </p>
                <p>
                    <strong>Current Score:</strong> {selectedPlayer.gameScore || 0} pts
                </p>
            </div>
        </div>
    );
}
