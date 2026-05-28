const fs = require('fs');

async function run() {
  try {
    const res = await fetch('http://localhost:5005/api/platforms/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'leetcode',
        userId: 'demo-user-123',
        platformUsername: 'lalitmodi'
      })
    });
    const data = await res.json();
    fs.writeFileSync('f:\\Codeyx\\test_hr_output.json', JSON.stringify(data, null, 2));
    console.log("LeetCode sync diagnostic complete. Output saved to test_hr_output.json");
  } catch (err) {
    console.error("Error executing diagnostic sync:", err);
  }
}

run();
