const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

// Route Imports
const authRoutes = require('./routes/auth');
const orchestratorRoutes = require('./routes/orchestrator');
const agentRoutes = require('./routes/agents');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Simple Status Check
app.get('/status', (req, res) => {
  res.json({ 
    status: 'online', 
    database: sequelize.options.dialect,
    timestamp: new Date()
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Express Error Handler]:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// Initialize database and start Server
async function startServer() {
  try {
    console.log('Synchronizing database schema...');
    // Avoid destructive schema changes in production.
    const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
    await sequelize.sync(syncOptions);
    console.log('Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Core startup failure:', error);
    process.exit(1);
  }
}

startServer();
