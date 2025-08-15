import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@config/baseUrl";
import { useUser } from "@contexts/UserContext";
import styles from "./Leaderboard.module.css";
import LobbyHeader from "@components/Lobby/LobbyHeader";
import { avatarList } from "@utils/loadAvatars";
import BackToLobbyButton from "@components/General/BackToLobbyButton/BackToLobbyButton";

export default function Leaderboard() {
    const { user } = useUser();
    const [data, setData] = useState({ topPlayers: [], currentPlayer: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`${baseUrl}/stats/leaderboard`, { withCredentials: true })
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch leaderboard", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    console.log(data);
    return (
        <div className={styles.container}>
            <LobbyHeader username={user?.username} />
            <div className={styles.header}>
                <h1>Leaderboard</h1>
                <p>Top {data.leaderboardSize} Players</p>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Country</th>
                        <th>Wins</th>
                        <th>Win Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {data.topPlayers.map((p, idx) => (
                        <tr key={p.username} className={p.username === user?.username ? styles.highlight : ""}>
                            <td>{idx + 1}</td>
                            <td className={styles.playerCell}>
                                <img src={avatarList[p.avatar] || avatarList[0]} alt="avatar" className={styles.avatar} />
                                {p.username}
                            </td>
                            <td>
                                <img src="https://flagcdn.com/w20/us.png" width="20" alt="us-flag" />
                            </td>
                            <td>{p.statistics?.Wins ?? p.wins}</td>
                            <td>{(p.statistics?.winRate ?? p.winRate).toFixed(1)}%</td>
                        </tr>
                    ))}
                    {data.currentPlayer && (
                        <tr className={styles.highlight}>
                            <td>{`${data.currentPlayer.rank}+`}</td>
                            <td className={styles.playerCell}>
                                <img src={`/avatars/${data.currentPlayer.avatar}.png`} alt="avatar" className={styles.avatar} />
                                {data.currentPlayer.username}
                            </td>
                            <td>{data.currentPlayer.flag || data.currentPlayer.country}</td>
                            <td>{data.currentPlayer.wins}</td>
                            <td>{data.currentPlayer.winRate.toFixed(1)}%</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <BackToLobbyButton />
        </div>
    );
}
