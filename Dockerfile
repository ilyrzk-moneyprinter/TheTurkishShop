FROM node:18-slim as build

# Set working directory
WORKDIR /app

# Copy package files 
COPY package*.json ./
COPY the-turkish-shop/package*.json ./the-turkish-shop/

# Install dependencies for both root and nested project
RUN npm ci --production
RUN cd the-turkish-shop && npm ci --production

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

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the server
CMD [ "node", "server.js" ] 