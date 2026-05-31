const fetch = require('node-fetch') || globalThis.fetch;

async function test() {
  const username = 'lalitmodiog7e';
  
  // Test Strategy 1: Direct Fetch
  try {
    const res = await fetch(`https://www.geeksforgeeks.org/profile/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
      }
    });
    console.log('Strategy 1 status:', res.status);
    const text = await res.text();
    console.log('Strategy 1 text length:', text.length);
    console.log('Contains "Coding Score":', text.includes('Coding Score'));
    console.log('Contains "lalitmodiog7e":', text.includes('lalitmodiog7e'));
  } catch (err) {
    console.log('Strategy 1 error:', err.message);
  }

  // Test Strategy 2: nikhilpal GFG API
  try {
    const res = await fetch(`https://gfgstatscard.vercel.app/${username}?raw=true`);
    console.log('Strategy 2 status:', res.status);
    const json = await res.json();
    console.log('Strategy 2 JSON:', json);
  } catch (err) {
    console.log('Strategy 2 error:', err.message);
  }
}

test();
