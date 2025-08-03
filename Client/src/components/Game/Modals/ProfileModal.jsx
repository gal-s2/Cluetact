import styles from "./ProfileModal.module.css";

export default function PlayerProfileModal({ selectedPlayer }) {
    console.log(selectedPlayer);
    return (
        <div className={styles.profileCard}>
            <button className={styles.closeButton} onClick={() => setSelectedPlayer(null)}>
                &times;
            </button>
            <h2 className={styles.username}>{selectedPlayer.username}</h2>
            <div className={styles.country}>
                <img src="https://flagcdn.com/w40/us.png" srcSet="https://flagcdn.com/w80/us.png 2x" width="40" alt="us-flag" />
                <span>US</span>
            </div>
            <div className={styles.stats}>
                <p>
                    <strong>Wins:</strong> {selectedPlayer.wins}
                </p>
                <p>
                    <strong>Total Games:</strong> {selectedPlayer.totalGames}
                </p>
            </div>
        </div>
    );
}
