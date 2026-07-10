FROM node:20-slim

# Install system dependencies used by backend packages
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root and backend package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies and build the frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Copy all source code
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Move built frontend to backend dist folder for static serving
RUN rm -rf /app/backend/dist && mv /app/frontend/dist /app/backend/dist

WORKDIR /app/backend

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
