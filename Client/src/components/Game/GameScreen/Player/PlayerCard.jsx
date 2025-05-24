import classNames from "classnames";
import styles from "./PlayerCard.module.css";

const images = import.meta.glob("../../../../assets/avatars/avatar_*.png", { eager: true });

const avatarMap = Object.fromEntries(
    Object.entries(images).map(([path, mod]) => {
        const index = path.match(/avatar_(\d+)\.png$/)?.[1];
        return [index, mod.default];
    })
);

const PlayerCard = ({ player, me, onClick }) => {
    const avatarSrc = avatarMap[player.avatar] || avatarMap[0];

    return (
        <div className={classNames(styles.card, { [styles.me]: me })} onClick={onClick}>
            <div className={styles.inner}>
                <div className={styles.playerImageContainer}>
                    <img className={styles.playerImage} src={avatarSrc} alt={`${player.username}'s avatar`} />
                </div>
                <div className={styles.playerDataContainer}>
                    <h3>{player.username}</h3>
                    <p>{player.gameScore} pts</p>
                    <span className={styles.roleTag}>{player.role.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;
