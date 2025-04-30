#!/bin/bash

# Log startup
echo "Starting Glitch startup script at $(date)"

# Kill any existing Node processes
echo "Killing any existing Node processes..."
pkill -f node || true

# Wait a moment
sleep 2

# Clear any error logs
rm -f server-error.txt uncaught-exception.txt server-running.txt

# Start the server
echo "Starting server..."
node glitch-server.js &

# Wait for server to start (up to 30 seconds)
echo "Waiting for server to start..."
for i in {1..30}; do
  if [ -f server-running.txt ]; then
    echo "Server started successfully!"
    cat server-running.txt
    exit 0
  fi
  
  if [ -f server-error.txt ]; then
    echo "Server failed to start:"
    cat server-error.txt
    exit 1
  fi
  
  if [ -f uncaught-exception.txt ]; then
    echo "Server crashed with uncaught exception:"
    cat uncaught-exception.txt
    exit 1
  fi
  
  echo "Still waiting... ($i/30)"
  sleep 1
done

echo "Server failed to start within timeout period"
exit 1
