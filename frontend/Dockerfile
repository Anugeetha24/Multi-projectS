FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Vite app
RUN npm run build

# Expose port
EXPOSE 3000

ENV NODE_ENV=production

# Start the Express server
CMD ["npm", "start"]
