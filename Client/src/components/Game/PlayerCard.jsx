import classNames from "classnames";
import styles from "./PlayerCard.module.css";

const PlayerCard = ({ player, me, onClick }) => {
    return (
        <div className={classNames(styles.card, { [styles.me]: me })} onClick={onClick}>
            <div className={styles.inner}>
                <h3>{player.username}</h3>
                <p>{player.gameScore} pts</p>
                <span className={styles.roleTag}>{player.role.toUpperCase()}</span>
            </div>
        </div>
    );
};

export default PlayerCard;
