import styles from "./ProfileModal.module.css";

export default function PlayerProfileModal({ player, onClose }) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    ✕
                </button>
                <h2>{player.username}</h2>
                <span>
                    {<img src={`https://flagcdn.com/24x18/us.png`} alt={`US-flag`} />}
                    <span> US </span>
                </span>
                {/*player.country && <img src={`https://flagcdn.com/24x18/${player.country.toLowerCase()}.png`} alt={`${player.country}-flag`} />*/}
                <p>Wins: {player.wins}</p>
            </div>
        </div>
    );
}
