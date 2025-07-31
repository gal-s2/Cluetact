import { useUser } from "@contexts/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@config/baseUrl";
import styles from "./StatsPage.module.css";
import BackToLobbyButton from "../General/BackToLobbyButton/BackToLobbyButton";
import { avatarList } from "@utils/loadAvatars";

function StatsPage() {
    const { user } = useUser();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseUrl}/stats/${user._id}`);
                setStats(response.data.statistics);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
                setError("Failed to load statistics");
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Loading your stats...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <h2>Oops!</h2>
                    <p>{error}</p>
                </div>
                <BackToLobbyButton />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img src={avatarList[user.avatar || 0]} alt="Avatar" className={styles.avatar} />

                <h2>{user.username}'s Stats</h2>
            </div>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏆</div>
                    <div className={styles.statValue}>{stats.Wins}</div>
                    <div className={styles.statLabel}>Wins</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💔</div>
                    <div className={styles.statValue}>{stats.Losses}</div>
                    <div className={styles.statLabel}>Losses</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎮</div>
                    <div className={styles.statValue}>{stats.totalGames}</div>
                    <div className={styles.statLabel}>Total Games</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📊</div>
                    <div className={styles.statValue}>{stats.winRate}%</div>
                    <div className={styles.statLabel}>Win Rate</div>
                </div>
            </div>
            {stats.totalGames > 0 ? (
                <div className={styles.progressCard}>
                    <h3>Performance Overview</h3>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${stats.winRate}%` }}></div>
                    </div>
                    <div className={styles.progressText}>
                        Win Rate: {stats.winRate}% ({stats.Wins} wins out of {stats.totalGames} games)
                    </div>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🎯</div>
                    <h3>No games played yet!</h3>
                    <p>Start playing to see your statistics here.</p>
                </div>
            )}
            <BackToLobbyButton />
        </div>
    );
}

export default StatsPage;
