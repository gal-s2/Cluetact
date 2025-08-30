const User = require("../../models/User");

const LEADERBOARD_SIZE = 100;

async function getUserStatsById(req, res) {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ statistics: user.statistics });
    } catch (err) {
        console.error("Error fetching user stats:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function getLeaderboard(req, res) {
    try {
        const topPlayersRaw = await User.aggregate([
            {
                $project: {
                    username: 1,
                    country: 1,
                    avatar: 1,
                    wins: { $ifNull: ["$statistics.Wins", 0] },
                    winRate: { $ifNull: ["$statistics.winRate", 0] },
                },
            },
            { $sort: { wins: -1, winRate: -1, username: 1 } },
            { $limit: LEADERBOARD_SIZE },
        ]);

        const topPlayers = topPlayersRaw.map((player, index) => ({
            ...player,
            rank: index + 1,
        }));

        if (req.user && req.user.username) {
            const userData = await User.findOne({ username: req.user.username }, { username: 1, country: 1, avatar: 1, "statistics.Wins": 1, "statistics.winRate": 1 }).lean();

            if (userData) {
                const wins = userData.statistics?.Wins ?? 0;
                const winRate = userData.statistics?.winRate ?? 0;
                const isInTop = topPlayers.some((p) => String(p._id) === String(userData._id));

                if (!isInTop) {
                    let currentPlayer = {
                        rank: `${LEADERBOARD_SIZE}+`,
                        _id: userData._id,
                        username: userData.username,
                        country: userData.country,
                        avatar: userData.avatar,
                        wins,
                        winRate,
                    };

                    topPlayers.push(currentPlayer);
                }
            }
        }

        return res.json({
            topPlayers, // may contain LEADERBOARD_SIZE + 1 when appended
            leaderboardSize: LEADERBOARD_SIZE,
        });
    } catch (err) {
        console.error("Leaderboard error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getUserStatsById,
    getLeaderboard,
};
