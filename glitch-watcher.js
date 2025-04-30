// Custom watcher script for Glitch
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const config = {
  // Directories to watch
  watchDirs: ['server'],
  
  // Files to watch
  watchFiles: ['package.json', 'glitch-setup.js'],
  
  // Directories to ignore
  ignoreDirs: ['node_modules', 'public', '.git'],
  
  // File extensions to watch
  watchExtensions: ['.js', '.json'],
  
  // Throttle time in milliseconds
  throttleTime: 5000
};

let serverProcess = null;
let lastRestartTime = 0;
let restartPending = false;

// Function to start the server
function startServer() {
  console.log('Starting server...');
  
  // Kill existing process if it exists
  if (serverProcess) {
    console.log('Killing existing server process...');
    serverProcess.kill();
  }
  
  // Run the setup script first
  console.log('Running setup script...');
  const setupProcess = spawn('node', ['glitch-setup.js']);
  
  setupProcess.stdout.on('data', (data) => {
    console.log(`Setup: ${data}`);
  });
  
  setupProcess.stderr.on('data', (data) => {
    console.error(`Setup error: ${data}`);
  });
  
  setupProcess.on('close', (code) => {
    console.log(`Setup process exited with code ${code}`);
    
    // Start the server
    console.log('Starting main server process...');
    serverProcess = spawn('node', ['server/server.js']);
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
    
    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      serverProcess = null;
    });
  });
}

// Function to restart the server with throttling
function restartServer() {
  const now = Date.now();
  
  // If we've restarted recently, set a pending restart
  if (now - lastRestartTime < config.throttleTime) {
    if (!restartPending) {
      console.log('Throttling restart...');
      restartPending = true;
      
      setTimeout(() => {
        console.log('Executing pending restart...');
        restartPending = false;
        lastRestartTime = Date.now();
        startServer();
      }, config.throttleTime);
    }
  } else {
    // Otherwise restart immediately
    lastRestartTime = now;
    startServer();
  }
}

// Function to check if a file should be watched
function shouldWatchFile(filePath) {
  // Check if it's in the ignore list
  for (const dir of config.ignoreDirs) {
    if (filePath.includes(dir + path.sep)) {
      return false;
    }
  }
  
  // Check if it's a directory we want to watch
  for (const dir of config.watchDirs) {
    if (filePath.startsWith(dir + path.sep)) {
      const ext = path.extname(filePath);
      return config.watchExtensions.includes(ext);
    }
  }
  
  // Check if it's a specific file we want to watch
  return config.watchFiles.includes(path.basename(filePath));
}

// Function to watch a directory recursively
function watchDirectory(dir) {
  try {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      
      const filePath = path.join(dir, filename);
      
      if (shouldWatchFile(filePath)) {
        console.log(`File changed: ${filePath}`);
        restartServer();
      }
    });
    
    console.log(`Watching directory: ${dir}`);
  } catch (err) {
    console.error(`Error watching directory ${dir}:`, err);
  }
}

// Start watching directories
console.log('Starting watcher...');
for (const dir of config.watchDirs) {
  watchDirectory(dir);
}

// Watch individual files
for (const file of config.watchFiles) {
  try {
    fs.watch(file, (eventType, filename) => {
      console.log(`File changed: ${file}`);
      restartServer();
    });
    
    console.log(`Watching file: ${file}`);
  } catch (err) {
    console.error(`Error watching file ${file}:`, err);
  }
}

// Initial server start
startServer();

console.log('Watcher started successfully!');
