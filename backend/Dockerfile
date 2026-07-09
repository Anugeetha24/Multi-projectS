FROM node:20-slim

# Install system dependencies if required
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (only production if needed, but we install all here)
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5000
    1+7
    
# Set environment
ENV NODE_ENV=production

# Run start script
CMD ["npm", "start"]
