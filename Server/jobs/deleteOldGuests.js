const cron = require("node-cron");
const User = require("../models/User");
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function deleteOldGuests() {
    const cutoffDate = new Date(Date.now() - ONE_DAY_MS);

    const countToDelete = await User.countDocuments({
        guest: true,
        createdAt: { $lt: cutoffDate },
    });

    const result = await User.deleteMany({
        guest: true,
        createdAt: { $lt: cutoffDate },
    });

    console.log(`[CRON] Deleted ${countToDelete} old guest users at midnight`);
}

// Delete old guests every day at midnight
cron.schedule("0 0 * * *", deleteOldGuests);
