FROM node:18-slim as build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY the-turkish-shop/package*.json ./the-turkish-shop/
COPY the-turkish-shop/src/api/package*.json ./the-turkish-shop/src/api/

# Install dependencies for main app first
RUN npm ci

# Install nested dependencies
RUN cd the-turkish-shop && npm ci
RUN cd the-turkish-shop/src/api && npm ci

# Copy project files
COPY . .

# Build React app
RUN cd the-turkish-shop && npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./
COPY --from=build /app/emailService.js ./
COPY --from=build /app/the-turkish-shop/build ./the-turkish-shop/build
COPY --from=build /app/the-turkish-shop/src/api ./the-turkish-shop/src/api

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Add a simple health check file to troubleshoot startup issues
RUN echo '#!/bin/sh\nnode -e "console.log(\"Container startup check: Node.js is working\"); process.exit(0)"' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Start the server with improved error logging
CMD ["sh", "-c", "echo 'Starting server on port 8080' && node server.js || (echo 'Server failed to start' && exit 1)"] 