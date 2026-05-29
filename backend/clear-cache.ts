import { redisClient } from './src/config/redis.config';
import dotenv from 'dotenv';
dotenv.config();

async function clearCache() {
    try {
        await redisClient.del('codeyx:leaderboard');
        console.log('Leaderboard cache cleared');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
clearCache();
