import styles from "./PlayerCard.module.css";

const PlayerCard = ({ player, position }) => {
    return (
        <div className={styles.card}>
            <div className={styles.inner}>
            <h3>{player.name}</h3>
            <p>{player.score} pts</p>
            </div>
        </div> 
    );
};

export default PlayerCard;