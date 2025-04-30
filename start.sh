#!/bin/bash

# Fix permissions if needed
chmod +x start.sh

# Run the custom watcher script
node glitch-watcher.js
