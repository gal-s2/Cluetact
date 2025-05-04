import classNames from "classnames";
import styles from "./PlayerCard.module.css";

const PlayerCard = ({ player, me }) => {
    return (
        <div className={classNames(styles.card, { [styles.me]: me })}>
            <div className={styles.inner}>
                <h3>{player.username}</h3>
                <p>{player.gameScore} pts</p>
                <span className={styles.roleTag}>{player.role}</span>
            </div>
        </div>
    );
};

export default PlayerCard;
