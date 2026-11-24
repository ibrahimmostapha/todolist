# Use a lightweight Node.js image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first so Docker caches npm install when code changes
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the application source code
COPY src ./src

# Run as a non-root user for better security
USER node

# Document the port Express listens on
EXPOSE 5000

# Start the Express server
CMD ["node", "src/index.js"]