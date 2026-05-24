export const fetchCodeforcesStats = async (username: string) => {
  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
    
    if (!response.ok) {
      throw new Error(`Codeforces API returned ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 'OK') {
      throw new Error(result.comment || 'Codeforces API Error');
    }

    const user = result.result[0];

    // Note: To get total solved we would need to hit /user.status, 
    // but for quick profile sync, user.info provides rating and rank.
    return {
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'Unrated',
      totalSolved: 0, // Placeholder until user.status is implemented if needed
      raw: user,
    };

  } catch (error: any) {
    console.error(`Codeforces Fetch Error for ${username}:`, error.message);
    throw error;
  }
};
