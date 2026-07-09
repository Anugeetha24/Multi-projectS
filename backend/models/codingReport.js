const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CodingReport = sequelize.define('CodingReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  problem_title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  code_hash: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  code_submitted: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  correctness_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'coding_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CodingReport;
