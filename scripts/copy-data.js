import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const sourceFile = path.join(__dirname, '..', 'data', 'cards.json');
const targetDir = path.join(__dirname, '..', 'netlify', 'functions', 'data');
const targetFile = path.join(targetDir, 'cards.json');

// Create the target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log('Creating target directory:', targetDir);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the file
try {
  console.log('Copying cards.json to functions directory...');
  fs.copyFileSync(sourceFile, targetFile);
  console.log('Successfully copied cards.json to:', targetFile);
} catch (error) {
  console.error('Error copying cards.json:', error);
  process.exit(1);
} 