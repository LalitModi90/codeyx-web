import { UnifiedResponse } from '../providers/types';

/**
 * Normalizes and formats response data from any profile provider into a strict,
 * production-ready unified JSON response format.
 * 
 * IMPORTANT: For CodeChef, all rich fields (contests, heatmap, globalRank, etc.)
 * are preserved through the metadata.extra channel so the frontend can access them.
 */
export function normalizeProfile(
  platform: string,
  username: string,
  rawStats: any
): UnifiedResponse {
  const meta = rawStats.metadata || {};
  const extra = meta.extra || {};

  return {
    platform:  platform.toLowerCase(),
    username:  rawStats.username || username,
    rating:    Number(rawStats.rating)    || 0,
    solved:    Number(rawStats.solved)    || Number(rawStats.totalSolved) || 0,
    rank:      String(rawStats.rank || rawStats.stars || 'Member').trim(),
    followers: Number(rawStats.followers) || 0,
    stars:     Number(rawStats.starsNum || rawStats.stars) || 0,
    contests:  Number(rawStats.contestCount || rawStats.contests) || 0,
    metadata: {
      ...meta,
      highestRating: Number(rawStats.highestRating || meta.highestRating || rawStats.rating) || 0,
      extra: {
        ...extra,
        // Preserve CodeChef-specific rich fields
        countryRank:     Number(rawStats.countryRank  || extra.countryRank)  || 0,
        globalRank:      Number(rawStats.globalRank   || extra.globalRank)   || 0,
        name:            rawStats.name     || extra.name    || username,
        avatar:          rawStats.avatar   || extra.avatar  || '',
        country:         rawStats.country  || extra.country || '',
        contests:        Array.isArray(rawStats.contests) ? rawStats.contests
                         : Array.isArray(extra.contests)  ? extra.contests   : [],
        heatmap:         Array.isArray(rawStats.heatmap)  ? rawStats.heatmap
                         : Array.isArray(extra.heatmap)   ? extra.heatmap    : [],
        partiallySolved: Number(rawStats.partiallySolved || extra.partiallySolved) || 0,
        fullySolved:     Number(rawStats.fullySolved     || extra.fullySolved)     || 0,
      },
    },
  };
}
