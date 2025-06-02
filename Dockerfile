# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY the-turkish-shop/package*.json ./the-turkish-shop/
COPY the-turkish-shop/src/api/package*.json ./the-turkish-shop/src/api/

# Install dependencies
RUN npm install
RUN cd the-turkish-shop && npm install
RUN cd the-turkish-shop/src/api && npm install

# Copy source code
COPY . .

# Build React app
RUN cd the-turkish-shop && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./
COPY --from=build /app/cloud-config.env ./.env
COPY --from=build /app/the-turkish-shop/build ./the-turkish-shop/build
COPY --from=build /app/the-turkish-shop/src/api ./the-turkish-shop/src/api
COPY --from=build /app/the-turkish-shop/src/api/node_modules ./the-turkish-shop/src/api/node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV EMAIL_TRANSPORT=mock

# Verify installation
RUN node -e "console.log('Node.js is working correctly'); process.exit(0)"

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://localhost:8080/_health || exit 1

# Set user to non-root
USER node

# Start the server
CMD ["node", "server.js"] 