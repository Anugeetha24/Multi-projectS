FROM node:20-slim

# Install system dependencies used by backend packages
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy backend dependency manifests and install packages
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend .

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
