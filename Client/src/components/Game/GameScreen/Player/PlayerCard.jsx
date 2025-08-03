import classNames from "classnames";
import styles from "./PlayerCard.module.css";
import { avatarList } from "@utils/loadAvatars";

const PlayerCard = ({ player, me, isActiveClueGiver, onClick, setSelectedPlayer }) => {
    const avatarSrc = avatarList[player.avatar] || avatarList[0];

    return (
        <div
            className={classNames(styles.card, {
                [styles.me]: me,
                [styles.activeClueGiver]: isActiveClueGiver,
                [styles.keeper]: player.role === "keeper",
                [styles.seeker]: player.role === "seeker",
            })}
            onClick={() => {
                onClick(player);
                setSelectedPlayer(player);
            }}
        >
            <div className={styles.inner}>
                <div className={styles.playerImageContainer}>
                    <img className={styles.playerImage} src={avatarSrc} alt={`${player.username}'s avatar`} />
                    {isActiveClueGiver && (
                        <div className={styles.turnIndicator}>
                            <span className={styles.turnDot}></span>
                        </div>
                    )}
                </div>
                <div className={styles.playerDataContainer}>
                    <h3>{player.username}</h3>
                    <p>{player.gameScore} pts</p>
                    <div className={styles.badgeContainer}>
                        <span
                            className={classNames(styles.roleTag, {
                                [styles.keeperRole]: player.role === "keeper",
                                [styles.seekerRole]: player.role === "seeker",
                            })}
                        >
                            {player.role === "keeper" ? "🔐 KEEPER" : "🔍 SEEKER"}
                        </span>
                        {me && <span className={styles.youTag}>YOU</span>}
                        {isActiveClueGiver && <span className={styles.turnTag}>CURRENT TURN</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;
