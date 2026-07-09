const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  const normalizedUrl = databaseUrl.trim();
  let dialect = 'postgres';

  if (normalizedUrl.startsWith('sqlite:')) {
    dialect = 'sqlite';
  } else if (normalizedUrl.startsWith('mysql:')) {
    dialect = 'mysql';
  } else if (normalizedUrl.startsWith('postgres:') || normalizedUrl.startsWith('postgresql:')) {
    dialect = 'postgres';
  }

  console.log(`Connecting using DATABASE_URL... Dialect: ${dialect}`);
  sequelize = new Sequelize(normalizedUrl, {
    dialect,
    logging: false,
    dialectOptions: {
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    }
  });
} else if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
  console.log(`Connecting to MySQL database ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}...`);
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD || '', {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false
  });
} else {
  console.warn('No database configuration found. Falling back to SQLite for this deployment.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_PATH || './database.sqlite',
    logging: false
  });
}

module.exports = sequelize;
