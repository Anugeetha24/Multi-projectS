const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlacementScore = sequelize.define('PlacementScore', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  overall_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  resume_weight_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  interview_weight_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  skill_weight_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  coding_weight_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  communication_weight_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roadmap: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'placement_scores',
  timestamps: true,
  createdAt: 'generated_at',
  updatedAt: false
});

module.exports = PlacementScore;
