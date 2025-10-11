FROM node:22-alpine

# Build argument for base path
ARG BUILD_BASE_PATH=""
ENV BUILD_BASE_PATH=${BUILD_BASE_PATH}

# Install Chromium and necessary dependencies for WhatsApp Web
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-dejavu \
    ca-certificates \
    libstdc++ \
    libx11 \
    libxcomposite \
    libxcursor \
    libxdamage \
    libxext \
    libxfixes \
    libxi \
    libxrandr \
    libxrender \
    libxtst \
    at-spi2-core

# Tell Puppeteer to skip installing Chromium since we'll use the system one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bubu -u 1001

WORKDIR /home/bubu/app

# Create session data and uploads directories
RUN mkdir -p /home/bubu/app/session-data && \
    mkdir -p /home/bubu/app/uploads && \
    mkdir -p /home/bubu/app/logs

# Change ownership of the app directory to the bubu user
RUN chown -R bubu:nodejs /home/bubu/app

# Set proper permissions for the session data and logs directories
RUN chown bubu:nodejs /home/bubu/app/session-data && \
    chown bubu:nodejs /home/bubu/app/logs

# Copy the entrypoint script
COPY --chown=bubu:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER bubu

COPY --chown=bubu:nodejs . .

RUN npm install

# Create initial status.json file
RUN echo '{"authenticated": false}' > /home/bubu/app/status.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

