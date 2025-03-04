const Redis = require("ioredis")

const redis = new Redis({
    host: 'localhost',
    port: 6379
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('Connected to Redis successfully.');
  });

  async function wipeAllDataFromRedis() {
    try {
        await redis.flushall();
        console.log("All Redis data has been wiped successfully.");
    } catch (err) {
        console.error("Error wiping Redis data:", err);
    } finally {
        redis.quit();
    }
}

//wipeAllDataFromRedis();

module.exports = redis;