FROM node:18-slim as build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY the-turkish-shop/package*.json ./the-turkish-shop/
COPY the-turkish-shop/src/api/package*.json ./the-turkish-shop/src/api/

# Install dependencies for main app first
RUN npm ci --quiet

# Install nested dependencies
RUN cd the-turkish-shop && npm ci --quiet
RUN cd the-turkish-shop/src/api && npm ci --quiet

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
COPY --from=build /app/the-turkish-shop/src/api/node_modules ./the-turkish-shop/src/api/node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create a directory for email templates if it doesn't exist
RUN mkdir -p /app/the-turkish-shop/src/api/templates

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Add a simple health check file to troubleshoot startup issues
RUN echo '#!/bin/sh\nnode -e "console.log(\"Container startup check: Node.js is working\"); process.exit(0)"' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Verify dependencies before starting
RUN echo '#!/bin/sh\necho "Listing installed packages:"\nnpm list --depth=0' > /app/verify-deps.sh && \
    chmod +x /app/verify-deps.sh && \
    /app/verify-deps.sh

# Start the server with improved error logging
CMD ["node", "server.js"] 