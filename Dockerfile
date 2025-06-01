FROM node:18-slim as build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY the-turkish-shop/package*.json ./the-turkish-shop/
COPY the-turkish-shop/src/api/package*.json ./the-turkish-shop/src/api/

# Install dependencies for all projects
RUN npm ci
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
COPY --from=build /app/the-turkish-shop/build ./the-turkish-shop/build
COPY --from=build /app/the-turkish-shop/src/api ./the-turkish-shop/src/api

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Create a healthcheck endpoint file if it doesn't exist
# Cloud Run may terminate containers that don't respond to health checks
RUN echo 'const express = require("express");\n\
const app = express();\n\
app.get("/_health", (req, res) => res.status(200).send("OK"));\n\
app.listen(8080, "0.0.0.0");\n\
console.log("Health check server running on port 8080");' > healthcheck.js

# Start the server
CMD ["node", "server.js"] 