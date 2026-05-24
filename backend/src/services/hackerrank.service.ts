export const fetchHackerRankStats = async (username: string) => {
  try {
    // HackerRank hidden public REST API
    const response = await fetch(`https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`, {
      headers: {
        'User-Agent': 'Codeyx-Analytics/1.0',
      }
    });

    if (!response.ok) {
      throw new Error(`HackerRank API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.model) {
      throw new Error('HackerRank profile not found');
    }

    const profile = data.model;

    // Fetch badges
    const badgesResponse = await fetch(`https://www.hackerrank.com/rest/contests/master/hackers/${username}/badges`);
    let totalBadges = 0;
    if (badgesResponse.ok) {
      const badgesData = await badgesResponse.json();
      totalBadges = badgesData.models ? badgesData.models.length : 0;
    }

    return {
      username: profile.username,
      country: profile.country,
      level: profile.level,
      followers: profile.followers_count,
      totalBadges,
      raw: profile,
    };

  } catch (error: any) {
    console.error(`HackerRank Fetch Error for ${username}:`, error.message);
    throw error;
  }
};
