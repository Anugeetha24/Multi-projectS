const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResumeReport = sequelize.define('ResumeReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  resume_hash: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  ats_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  missing_sections: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  suggestions: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'resume_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ResumeReport;
