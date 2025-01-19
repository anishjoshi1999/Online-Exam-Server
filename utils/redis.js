require('dotenv').config()
const Redis = require('ioredis');

const getRedisURL = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error("Redis URL is not defined");
};

const redis = new Redis(getRedisURL());
module.exports = { redis };
