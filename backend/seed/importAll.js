const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

console.log(`Found ${files.length} sheets to import.\n`);

for (const file of files) {
  const filePath = path.join(dataDir, file);
  console.log(`===========================================`);
  console.log(`Starting import for ${file}...`);
  try {
    execSync(`node "${path.join(__dirname, 'importSingleSheet.js')}" "${filePath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to import ${file}`);
  }
}

console.log(`\n🎉 All sheets imported successfully!`);
