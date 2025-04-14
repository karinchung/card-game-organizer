const fs = require('fs');
const path = require('path');

// Create functions/data directory if it doesn't exist
const functionsDataDir = path.join(__dirname, '..', 'netlify', 'functions', 'data');
if (!fs.existsSync(functionsDataDir)) {
  fs.mkdirSync(functionsDataDir, { recursive: true });
}

// Copy cards.json to functions/data
const sourceFile = path.join(__dirname, '..', 'data', 'cards.json');
const targetFile = path.join(functionsDataDir, 'cards.json');

try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log('Successfully copied cards.json to functions/data directory');
} catch (error) {
  console.error('Error copying cards.json:', error);
  process.exit(1);
} 