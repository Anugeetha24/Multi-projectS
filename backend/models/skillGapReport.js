const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SkillGapReport = sequelize.define('SkillGapReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target_role: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  missing_skills: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'skill_gap_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SkillGapReport;
