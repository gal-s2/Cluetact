import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "@config/baseUrl";
import { useUser } from "@contexts/UserContext";
import styles from "./Leaderboard.module.css";
import { avatarList } from "@utils/loadAvatars";
import LobbyHeader from "@components/Lobby/LobbyHeader";
import BackToLobbyButton from "@components/General/BackToLobbyButton/BackToLobbyButton";
import Spinner from "@components/common/Spinner/Spinner";
import Flag from "@components/common/Flag/Flag";

export default function Leaderboard() {
    const { user } = useUser();
    const [data, setData] = useState({ topPlayers: [], currentPlayer: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`${baseUrl}/stats/leaderboard`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setData(res.data);
                console.log(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch leaderboard", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className={styles.container}>
            <LobbyHeader username={user?.username} />

            {loading ? (
                <Spinner />
            ) : (
                <>
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
                                    <td>{p.rank}</td>
                                    <td className={styles.playerCell}>
                                        <img src={avatarList[p.avatar] || avatarList[0]} alt="avatar" className={styles.avatar} />
                                        {p.username}
                                    </td>
                                    <td>
                                        <Flag country={p.country} />
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
                </>
            )}
            <BackToLobbyButton />
        </div>
    );
}
