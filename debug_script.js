require('ts-node').register();
const { FallbackManager } = require('./backend/src/services/fallbackManager.ts');

(async () => {
  try {
    const manager = FallbackManager.getInstance();
    console.log("Resolving profile...");
    const profile = await manager.resolveProfile('leetcode', 'LalitModi90', true);
    console.log("SUCCESS!");
    console.log("Total Solved:", profile.totalSolved);
    console.log("Topics count:", profile.metadata?.topics?.length);
    console.log("Submissions count:", profile.metadata?.submissions?.length);
    console.log("Contests count:", profile.metadata?.contests?.length);
    console.log("Strategy Used:", profile.metadata?.resolutionDetails?.strategyUsed);
  } catch (err) {
    console.error("ERROR:", err);
  }
  process.exit(0);
})();
