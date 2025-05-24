import { useUser } from "../../contexts/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../config/baseUrl";

function StatsPage() {
    const { user } = useUser();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${baseUrl}/api/stats/${user._id}`);
                setStats(response.data.statistics);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        if (user?._id) {
            fetchStats();
        }
    }, [user]);

    if (!stats) return <div>Loading stats...</div>;

    return (
        <div>
            <h2>{user.username}'s Stats</h2>
            <ul>
                <li>Wins: {stats.Wins}</li>
                <li>Losses: {stats.Losses}</li>
                <li>Total Games: {stats.totalGames}</li>
                <li>Win Rate: {stats.winRate}%</li>
            </ul>
        </div>
    );
}

export default StatsPage;
