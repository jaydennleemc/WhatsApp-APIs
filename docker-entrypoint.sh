#!/bin/sh

# Set proper permissions for session data
mkdir -p /home/bubu/app/session-data
chown bubu:nodejs /home/bubu/app/session-data

# Run the Node.js application
exec node index.js