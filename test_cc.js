const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  const username = 'lalitmodi7878';
  const url = `https://www.codechef.com/users/${username}`;
  
  console.log(`[Diagnostic] Fetching profile from ${url}...`);
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.codechef.com/'
      }
    });
    
    const $ = cheerio.load(res.data);
    const solvedProblems = [];
    
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      
      const isProblemCode = /^[A-Z0-9_]{3,10}$/.test(text) && 
                            !['PRACTICE', 'COMPETE', 'DISCUSS', 'LEARN', 'HELP', 'USER', 'STATUS', 'SIGN'].includes(text);
      
      if (isProblemCode && (href.includes('/status/') || href.includes('/problems/'))) {
        if (!solvedProblems.includes(text)) {
          solvedProblems.push(text);
        }
      }
    });
    
    console.log(`\n=== DIAGNOSTIC SUCCESS ===`);
    console.log(`Successfully scraped ${solvedProblems.length} real solved problems!`);
    console.log(`Real Solved Problems list:`, solvedProblems);
    
    fs.writeFileSync('f:\\Codeyx\\test_cc_output.json', JSON.stringify({
      success: true,
      username,
      totalSolved: solvedProblems.length,
      solvedProblems
    }, null, 2));
    console.log(`Output saved to f:\\Codeyx\\test_cc_output.json`);
    
  } catch (err) {
    console.error("Error running diagnostic sync:", err.message);
  }
}

test();
