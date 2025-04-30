// Script to fix common Glitch issues
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running Glitch fix script...');

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Ensure server directory exists
ensureDirectoryExists(path.join(__dirname, 'server'));

// Check if database file exists
const dbPath = path.join(__dirname, 'server', 'university.db');
if (!fs.existsSync(dbPath)) {
  console.log('Database file does not exist. It will be created when the server starts.');
} else {
  console.log('Database file exists at:', dbPath);
}

// Fix npm audit issues
try {
  console.log('Fixing npm audit issues...');
  execSync('npm audit fix --force', { stdio: 'inherit' });
} catch (error) {
  console.error('Error fixing npm audit issues:', error.message);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file...');
  fs.writeFileSync(envPath, 'NODE_ENV=production\n');
}

console.log('Glitch fix script completed successfully!');
