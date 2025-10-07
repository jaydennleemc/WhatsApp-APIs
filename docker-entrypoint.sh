#!/bin/sh

# Set proper permissions for session data
mkdir -p /home/bubu/app/session-data
chown bubu:nodejs /home/bubu/app/session-data

# Set BASE_PATH from environment variable, defaulting to BUILD_BASE_PATH if not set
if [ -z "$BASE_PATH" ]; then
    export BASE_PATH=$BUILD_BASE_PATH
fi

# Log the base path for debugging
echo "BASE_PATH configured as: $BASE_PATH"

# Run the Node.js application
exec node index.js