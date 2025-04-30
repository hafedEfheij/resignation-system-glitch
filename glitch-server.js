// Simple Express server for Glitch
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - serve simple-index.html first, fallback to index.html
app.get('/', (req, res) => {
  const simplePath = path.join(__dirname, 'public', 'simple-index.html');
  const originalPath = path.join(__dirname, 'public', 'index.html');

  if (fs.existsSync(simplePath)) {
    res.sendFile(simplePath);
  } else if (fs.existsSync(originalPath)) {
    res.sendFile(originalPath);
  } else {
    res.send('<h1>Welcome to Hadhara University Registration System</h1><p>Server is running!</p>');
  }
});

// Start the server with proper error handling
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Write a file to indicate the server is running
  fs.writeFileSync('server-running.txt', `Server started at ${new Date().toISOString()}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);

  // Write error to file for debugging
  fs.writeFileSync('server-error.txt', `Error at ${new Date().toISOString()}: ${error.message}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  fs.writeFileSync('uncaught-exception.txt', `Error at ${new Date().toISOString()}: ${error.message}\n${error.stack}`);

  // Give the process a moment to write logs before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
