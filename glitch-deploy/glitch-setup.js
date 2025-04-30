// This script ensures the database is properly set up on Glitch
const fs = require('fs');
const path = require('path');

// Create server directory if it doesn't exist
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.log('Creating server directory...');
  fs.mkdirSync(serverDir, { recursive: true });
}

// Check if database file exists
const dbPath = path.join(serverDir, 'university.db');
if (!fs.existsSync(dbPath)) {
  console.log('Database file does not exist. It will be created when the server starts.');
} else {
  console.log('Database file exists at:', dbPath);
}

// Update package.json to include setup script
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add prestart script if it doesn't exist
    if (!packageJson.scripts.prestart) {
      packageJson.scripts.prestart = 'node glitch-setup.js';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Added prestart script to package.json');
    }
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
}

console.log('Glitch setup complete!');
