import classNames from "classnames";
import styles from "./PlayerCard.module.css";
import avatarList from "@utils/loadAvatars";
import Flag from "@components/common/Flag/Flag";

const PlayerCard = ({ player, me, isActiveClueGiver, selectedPlayer, setSelectedPlayer }) => {
    const avatarSrc = avatarList[player.avatar] || avatarList[0];
    const isExpanded = selectedPlayer?.username === player.username;

    const handleCardClick = () => {
        if (isExpanded) {
            setSelectedPlayer(null); // Close if already open
        } else {
            setSelectedPlayer(player);
        }
    };

    return (
        <div className={styles.cardWrapper}>
            <div
                className={classNames(styles.card, {
                    [styles.me]: me,
                    [styles.activeClueGiver]: isActiveClueGiver,
                    [styles.keeper]: player.role === "keeper",
                    [styles.seeker]: player.role === "seeker",
                    [styles.expanded]: isExpanded,
                })}
                onClick={handleCardClick}
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
                            {me && <span className={styles.youTag}>YOU</span>}
                            {isActiveClueGiver && <span className={styles.turnTag}>CURRENT TURN</span>}
                        </div>
                    </div>
                    <div className={styles.expandIcon}>
                        <span className={classNames(styles.chevron, { [styles.rotated]: isExpanded })}>▼</span>
                    </div>
                </div>
            </div>

            {/* Dropdown Profile */}
            {isExpanded && (
                <div className={styles.profileDropdown}>
                    <div className={styles.compactProfile}>
                        <div className={styles.countryRow}>
                            <Flag country={player.country} />
                            <span>US</span>
                        </div>
                        <div className={styles.statsGrid}>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Wins</span>
                                <span className={styles.statValue}>{player.wins || 0}</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Games</span>
                                <span className={styles.statValue}>{player.totalGames || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerCard;
