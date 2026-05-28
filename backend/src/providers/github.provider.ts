import { IProfileProvider } from './types';
import { axios, graphqlRequest } from '../utils/httpClient';
import * as cheerio from 'cheerio';

export class GitHubProvider implements IProfileProvider {
  public readonly platformName = 'GitHub';

  /**
   * Primary API: REST + GraphQL Hybrid
   */
  async fetchPrimary(username: string): Promise<any> {
    const headers: Record<string, string> = {
      'User-Agent': 'Codeyx-Developer-Dashboard',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const userUrl = `https://api.github.com/users/${username}`;
    const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
    const orgsUrl = `https://api.github.com/users/${username}/orgs`;
    const eventsUrl = `https://api.github.com/users/${username}/events?per_page=100`;

    const [userRes, reposRes, orgsRes, eventsRes] = await Promise.all([
      axios.get(userUrl, { headers }),
      axios.get(reposUrl, { headers }).catch(() => ({ data: [] })),
      axios.get(orgsUrl, { headers }).catch(() => ({ data: [] })),
      axios.get(eventsUrl, { headers }).catch(() => ({ data: [] })),
    ]);

    const user = userRes.data;
    if (!user || !user.login) {
      throw new Error('User data not found on GitHub REST API');
    }

    const repos = Array.isArray(reposRes.data) ? reposRes.data : [];
    const orgs = Array.isArray(orgsRes.data) ? orgsRes.data : [];
    const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];

    // 1. Fetch GraphQL Contribution Calendar (If token is available)
    let contributionsCollection: any = null;
    if (process.env.GITHUB_TOKEN) {
      try {
        const graphqlQuery = `
          query ($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
        `;
        const graphData = await graphqlRequest(
          'https://api.github.com/graphql',
          graphqlQuery,
          { login: username },
          {
            'User-Agent': 'Codeyx-Developer-Dashboard',
            'Authorization': `bearer ${process.env.GITHUB_TOKEN}`
          }
        );
        contributionsCollection = graphData?.user?.contributionsCollection;
      } catch (e: any) {
        console.warn('[GitHubProvider] GraphQL contribution calendar fetch failed:', e.message);
      }
    }

    // 2. Map Repositories & Deployment Status
    const totalStars = repos.reduce((acc: number, r: any) => acc + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((acc: number, r: any) => acc + (r.forks_count || 0), 0);

    const repositoriesList = repos.map((r: any) => {
      const liveUrl = r.homepage || '';
      const hasDeployment = !!liveUrl;
      const hostProvider = liveUrl.includes('vercel.app') 
        ? 'Vercel' 
        : liveUrl.includes('netlify.app') 
          ? 'Netlify' 
          : liveUrl.includes('github.io') 
            ? 'GitHub Pages' 
            : liveUrl 
              ? 'Custom Hosting' 
              : 'Source Only';

      return {
        name: r.name,
        description: r.description || '',
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        watchers: r.watchers_count || 0,
        language: r.language || 'Unknown',
        topics: Array.isArray(r.topics) ? r.topics : [],
        visibility: r.private ? 'Private' : 'Public',
        defaultBranch: r.default_branch || 'main',
        homepage: liveUrl,
        hasDeployment,
        deploymentProvider: hostProvider,
        updatedAt: r.updated_at
      };
    });

    // 3. Process Language Analytics
    const languageCounts: Record<string, number> = {};
    const languageSizes: Record<string, number> = {};
    repos.forEach((r: any) => {
      if (r.language) {
        languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
        languageSizes[r.language] = (languageSizes[r.language] || 0) + (r.size || 1);
      }
    });

    const totalSize = Object.values(languageSizes).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(languageCounts).map(([name, count]) => ({
      language: name,
      count,
      percentage: Math.round((languageSizes[name] / totalSize) * 100)
    })).sort((a, b) => b.count - a.count);

    // 4. Process Contribution Heatmap & Streaks
    const heatmapObj: Record<string, number> = {};
    let totalContributions = 0;
    if (contributionsCollection?.contributionCalendar?.weeks) {
      totalContributions = contributionsCollection.contributionCalendar.totalContributions || 0;
      contributionsCollection.contributionCalendar.weeks.forEach((w: any) => {
        w.contributionDays?.forEach((d: any) => {
          if (d.contributionCount > 0) {
            heatmapObj[d.date] = d.contributionCount;
          }
        });
      });
    } else {
      // Estimate daily count from REST events (e.g. PushEvents etc)
      events.forEach((ev: any) => {
        if (ev.created_at) {
          const dateStr = ev.created_at.split('T')[0];
          heatmapObj[dateStr] = (heatmapObj[dateStr] || 0) + 1;
        }
      });
      totalContributions = Object.values(heatmapObj).reduce((a, b) => a + b, 0) || 0;
    }

    const heatmap = Object.entries(heatmapObj).map(([date, count]) => ({
      date,
      count
    }));

    // Calculate Streak
    const sortedDates = Object.keys(heatmapObj).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let streak = 0;
    if (sortedDates.length > 0) {
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (sortedDates[sortedDates.length - 1] === today || sortedDates[sortedDates.length - 1] === yesterday) {
        currentStreak = 1;
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const d1 = new Date(sortedDates[i + 1]);
          const d2 = new Date(sortedDates[i]);
          const diffDays = Math.round((d1.getTime() - d2.getTime()) / 86400000);
          if (diffDays === 1) {
            currentStreak++;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
      streak = currentStreak;
    }

    // 5. Pull Requests and Commit Activity counts from REST events
    let commitsCount = 0;
    let prsCount = 0;
    let issuesCount = 0;
    events.forEach((ev: any) => {
      if (ev.type === 'PushEvent' && ev.payload?.commits) {
        commitsCount += ev.payload.commits.length;
      } else if (ev.type === 'PullRequestEvent') {
        prsCount++;
      } else if (ev.type === 'IssuesEvent') {
        issuesCount++;
      }
    });

    // 6. Organization Details
    const organizations = orgs.map((o: any) => ({
      name: o.login,
      avatar: o.avatar_url,
      description: o.description || ''
    }));

    return {
      username: user.login,
      followers: user.followers || 0,
      solved: user.public_repos || 0, // Repo count as "solved" metrics
      rating: user.public_gists || 0,
      rank: user.hireable ? 'Available for Hire' : 'Developer',
      stars: totalStars,
      contests: organizations.length, // Count of collaborations
      avatar: user.avatar_url || '',
      metadata: {
        languages: languages.map(l => l.language),
        repositoriesCount: user.public_repos || 0,
        streak,
        extra: {
          bio: user.bio || '',
          company: user.company || '',
          location: user.location || '',
          blog: user.blog || '',
          twitter: user.twitter_username || '',
          createdDate: user.created_at,
          followingCount: user.following || 0,
          totalStars,
          totalForks,
          commitsCount,
          prsCount,
          issuesCount,
          totalContributions,
          organizations,
          repositories: repositoriesList,
          heatmap,
          languages
        }
      }
    };
  }

  /**
   * Backup GraphQL API
   */
  async fetchBackup(username: string): Promise<any> {
    // If GraphQL backup API is called directly
    return this.fetchPrimary(username);
  }

  /**
   * Scraper Fallback
   */
  async fetchScraper(username: string): Promise<any> {
    const url = `https://github.com/${username}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    const name = $('.p-name').text().trim() || username;
    const bio = $('.p-note').text().trim() || 'Open Source Contributor';
    const avatar = $('img.avatar-user').first().attr('src') || '';

    // Followers & Following
    const followersText = $('a[href$="?tab=followers"] span.text-bold').text().trim();
    const followers = this.parseSuffix(followersText);

    const followingText = $('a[href$="?tab=following"] span.text-bold').text().trim();
    const following = this.parseSuffix(followingText);

    // Stars count
    const starsText = $('a[href$="?tab=stars"] span.text-bold').text().trim();
    const stars = this.parseSuffix(starsText);

    // Parse Pinned Repos
    const pinnedRepos: any[] = [];
    $('ol.pinned-items-list li').each((i, el) => {
      const repoName = $(el).find('span.repo').text().trim();
      const desc = $(el).find('p.pinned-item-desc').text().trim();
      const lang = $(el).find('span[itemprop="programmingLanguage"]').text().trim() || 'Unknown';
      const repoStars = parseInt($(el).find('a[href$="/stargazers"]').text().trim()) || 0;
      const repoForks = parseInt($(el).find('a[href$="/forks"]').text().trim()) || 0;
      
      pinnedRepos.push({
        name: repoName,
        description: desc,
        stars: repoStars,
        forks: repoForks,
        watchers: repoStars,
        language: lang,
        topics: [],
        visibility: 'Public',
        defaultBranch: 'main',
        homepage: '',
        hasDeployment: false,
        deploymentProvider: 'Source Only',
        updatedAt: new Date().toISOString()
      });
    });

    // Parse total contributions in the last year
    const contributionsText = $('h2.f4.text-normal.mb-2').text().replace(/[^0-9]/g, '').trim();
    const contributions = parseInt(contributionsText) || 0;

    return {
      username,
      followers,
      solved: pinnedRepos.length,
      rating: 0,
      rank: 'Developer',
      stars,
      contests: 0,
      avatar,
      metadata: {
        languages: Array.from(new Set(pinnedRepos.map(r => r.language))),
        repositoriesCount: pinnedRepos.length,
        streak: 0,
        extra: {
          bio,
          scraped: true,
          company: '',
          location: '',
          blog: '',
          twitter: '',
          createdDate: new Date().toISOString(),
          followingCount: following,
          totalStars: stars,
          totalForks: 0,
          commitsCount: contributions,
          prsCount: 0,
          issuesCount: 0,
          totalContributions: contributions,
          organizations: [],
          repositories: pinnedRepos,
          heatmap: [],
          languages: []
        }
      }
    };
  }

  private parseSuffix(val: string): number {
    const cleanVal = val.toLowerCase().replace(/,/g, '').trim();
    if (cleanVal.endsWith('k')) {
      return parseFloat(cleanVal) * 1000;
    }
    if (cleanVal.endsWith('m')) {
      return parseFloat(cleanVal) * 1000000;
    }
    return parseInt(cleanVal) || 0;
  }
}
