const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommunicationReport = sequelize.define('CommunicationReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  response_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  clarity_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  grammar_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'communication_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CommunicationReport;
