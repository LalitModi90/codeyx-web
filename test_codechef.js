const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const username = 'lalitmodi7878';
  const url = `https://www.codechef.com/users/${username}`;
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    
    console.log("--- RATING NUMBER ---");
    console.log($('.rating-number').first().text().trim());
    
    console.log("--- RATING RANKS HTML ---");
    console.log($('.rating-ranks').html());
    
    console.log("--- INLINE LIST HTML ---");
    console.log($('.inline-list').html());
    
    console.log("--- RATING RANKS TEXT ---");
    $('.rating-ranks li, .inline-list li').each((i, el) => {
      console.log(`LI ${i}:`, $(el).text().trim());
      console.log(`LI ${i} HTML:`, $(el).html());
    });
  } catch (err) {
    console.error(err);
  }
}

test();
