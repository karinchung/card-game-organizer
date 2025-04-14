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

console.log('Source file:', sourceFile);
console.log('Target directory:', targetDir);
console.log('Target file:', targetFile);

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error('Source file does not exist:', sourceFile);
  process.exit(1);
}

// Create the target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log('Creating target directory:', targetDir);
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('Successfully created target directory');
  } catch (error) {
    console.error('Error creating target directory:', error);
    process.exit(1);
  }
}

// Copy the file
try {
  console.log('Copying cards.json to functions directory...');
  fs.copyFileSync(sourceFile, targetFile);
  console.log('Successfully copied cards.json to:', targetFile);
  
  // Verify the file was copied correctly
  if (fs.existsSync(targetFile)) {
    const sourceSize = fs.statSync(sourceFile).size;
    const targetSize = fs.statSync(targetFile).size;
    console.log(`Source file size: ${sourceSize} bytes`);
    console.log(`Target file size: ${targetSize} bytes`);
    
    if (sourceSize === targetSize) {
      console.log('File sizes match, copy successful');
    } else {
      console.error('File sizes do not match, copy may have failed');
      process.exit(1);
    }
  } else {
    console.error('Target file does not exist after copy');
    process.exit(1);
  }
} catch (error) {
  console.error('Error copying cards.json:', error);
  process.exit(1);
} 