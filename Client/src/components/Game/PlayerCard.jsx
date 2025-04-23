import styles from "./PlayerCard.module.css";

const PlayerCard = ({ player, position }) => {
    return (
        <div className={styles.card}>
            <div className={styles.inner}>
                <h3>{player.username}</h3>
                <p>{player.gameScore} pts</p>
                <span className={styles.roleTag}>{player.role}</span>
            </div>
        </div>
    );
};

export default PlayerCard;
