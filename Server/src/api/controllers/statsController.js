const User = require("../../models/User");

const LEADERBOARD_SIZE = 3;

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
        // 1) Top N players (flatten wins/winRate so sorting is reliable)
        const topPlayers = await User.aggregate([
            {
                $project: {
                    username: 1,
                    country: 1,
                    avatar: 1,
                    wins: { $ifNull: ["$statistics.Wins", 0] },
                    winRate: { $ifNull: ["$statistics.winRate", 0] },
                },
            },
            { $sort: { wins: -1, winRate: -1, username: 1 } }, // tie-breakers optional
            { $limit: LEADERBOARD_SIZE },
        ]);

        let currentPlayer = null;

        // 2) If logged-in user exists, fetch fresh data from DB
        if (req.user && mongoose.Types.ObjectId.isValid(String(req.user._id))) {
            const userData = await User.findById(req.user._id, { username: 1, country: 1, avatar: 1, "statistics.Wins": 1, "statistics.winRate": 1 }).lean();

            if (userData) {
                const wins = userData.statistics?.Wins ?? 0;
                const winRate = userData.statistics?.winRate ?? 0;

                // Is the user already in the top list?
                const isInTop = topPlayers.some((p) => String(p._id) === String(userData._id));

                if (!isInTop) {
                    // 3) Compute rank (by Wins; add tie-breakers if you want)
                    const playerRank = (await User.countDocuments({ "statistics.Wins": { $gt: wins } })) + 1;

                    currentPlayer = {
                        rank: playerRank,
                        _id: userData._id,
                        username: userData.username,
                        country: userData.country,
                        avatar: userData.avatar,
                        wins,
                        winRate,
                    };

                    // 4) Append the current player to the returned list (so client always gets them)
                    topPlayers.push(currentPlayer);
                }
            }
        }

        return res.json({
            topPlayers, // may contain LEADERBOARD_SIZE + 1 when appended
            currentPlayer, // null if already in top or not logged in
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
