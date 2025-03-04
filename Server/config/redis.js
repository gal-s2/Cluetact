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

  module.exports = redis;