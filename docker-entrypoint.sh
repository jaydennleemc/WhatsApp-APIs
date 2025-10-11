#!/bin/sh

# Set proper permissions for session data, but don't fail if chown fails
mkdir -p /home/bubu/app/session-data
mkdir -p /home/bubu/app/logs

# Only attempt chown if the user exists (to handle Synology NAS and other systems where this might fail)
if id bubu >/dev/null 2>&1; then
    chown bubu:nodejs /home/bubu/app/session-data 2>/dev/null || echo "Warning: Could not change ownership of session-data directory (this is normal with named volumes)."
    chown bubu:nodejs /home/bubu/app/logs 2>/dev/null || echo "Warning: Could not change ownership of logs directory (this is normal with named volumes)."
else
    echo "Info: User bubu does not exist in container, skipping chown operations (this is expected when running as specific UID in docker-compose)."
fi

# Set BASE_PATH from environment variable, defaulting to BUILD_BASE_PATH if not set
if [ -z "$BASE_PATH" ]; then
    export BASE_PATH=$BUILD_BASE_PATH
fi

# Log the base path for debugging
echo "BASE_PATH configured as: $BASE_PATH"

# Run the Node.js application
exec node index.js