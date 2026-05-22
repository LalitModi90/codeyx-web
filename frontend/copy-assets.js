const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('f:/Codeyx_/coderyx/frontend/public');
const destDir = path.resolve('f:/Codeyx/frontend/public');

function copyFolderRecursiveSync(source, target) {
  let files = [];

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        const curTarget = path.join(targetFolder, file);
        fs.copyFileSync(curSource, curTarget);
        console.log(`Copied: ${file}`);
      }
    });
  }
}

try {
  // If destination public doesn't exist, create it
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  // Copy contents of srcDir to destDir
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      const curSource = path.join(srcDir, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, destDir);
      } else {
        const curTarget = path.join(destDir, file);
        fs.copyFileSync(curSource, curTarget);
        console.log(`Copied: ${file}`);
      }
    });
    console.log("SUCCESS: All assets copied successfully!");
  } else {
    console.error("ERROR: Source folder not found at " + srcDir);
  }
} catch (err) {
  console.error("ERROR: Failed to copy assets:", err);
}
