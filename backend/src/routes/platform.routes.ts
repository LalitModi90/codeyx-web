import { Router } from 'express';
import { triggerPlatformSync, getPlatformStats, getAllPlatformStats, disconnectPlatform } from '../controllers/platform.controller';
import { protectRoute } from '../middlewares/clerk.middleware';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const router = Router();

// Test Route (Public)
router.get('/health', (req, res) => res.json({ status: 'Platform Service Active' }));

// Live HackerRank API test (Public Diagnostic)
router.get('/test-hr', async (req, res) => {
  const username = (req.query.username as string) || 'lalitmodi7878065';
  const url = `https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`;
  const badgesUrl = `https://www.hackerrank.com/rest/hackers/${username}/badges`;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://www.hackerrank.com/'
  };

  try {
    const { axios } = require('../utils/httpClient');
    const [profileRes, badgesRes] = await Promise.all([
      axios.get(url, { headers }),
      axios.get(badgesUrl, { headers }).catch((e: any) => ({ data: { models: [], error: e.message } }))
    ]);

    const payload = {
      success: true,
      profile: profileRes.data,
      badges: badgesRes.data
    };

    // Write to a local file in the workspace
    fs.writeFileSync(
      path.join('f:', 'Codeyx', 'test_hr_output.json'),
      JSON.stringify(payload, null, 2),
      'utf-8'
    );

    return res.json(payload);
  } catch (err: any) {
    const errPayload = {
      success: false,
      message: err.message,
      stack: err.stack
    };
    fs.writeFileSync(
      path.join('f:', 'Codeyx', 'test_hr_output.json'),
      JSON.stringify(errPayload, null, 2),
      'utf-8'
    );
    return res.status(500).json(errPayload);
  }
});

// Diagnostic route for CodeChef scraping
router.get('/test-chef', async (req, res) => {
  const username = (req.query.username as string) || 'lalitmodi7878';
  const url = `https://www.codechef.com/users/${username}`;
  
  try {
    const { axios } = require('../utils/httpClient');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    const html = response.data;
    
    // Search for chart variables inside the HTML using regex
    const matches: string[] = [];
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = scriptRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.includes('all_rating') || content.includes('date_versus_rating') || content.includes('Highcharts.chart')) {
        matches.push(content.substring(0, 1000) + '... (truncated)');
      }
    }

    // Write full html for manual inspection if needed
    fs.writeFileSync(path.join('f:', 'Codeyx', 'test_chef_source.html'), html, 'utf-8');

    return res.json({
      success: true,
      matchesFound: matches.length,
      snippet: matches
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch Stats Route (GET)
router.get('/stats', getPlatformStats);

// Fetch All Platforms for a user (GET)
router.get('/all', getAllPlatformStats);

// Sync Route (POST)
router.post('/sync', triggerPlatformSync); 

// Disconnect Route (POST)
router.post('/disconnect', disconnectPlatform); 

export default router;
