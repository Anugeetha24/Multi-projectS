const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  const isMysql = process.env.DATABASE_URL.startsWith('mysql:');
  const dialect = isMysql ? 'mysql' : 'postgres';
  console.log(`Connecting using DATABASE_URL... Dialect: ${dialect}`);
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: dialect,
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
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('Production database configuration missing. Set DATABASE_URL or DB_* environment variables.');
} else {
  console.warn('Neither DATABASE_URL nor DB_HOST/DB_USER/DB_NAME set. Falling back to SQLite for local development.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}

module.exports = sequelize;
