const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InterviewReport = sequelize.define('InterviewReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  evaluation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  confidence_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'interview_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = InterviewReport;
