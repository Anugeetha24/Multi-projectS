const sequelize = require('../config/database');
const Student = require('./student');
const ResumeReport = require('./resumeReport');
const InterviewReport = require('./interviewReport');
const SkillGapReport = require('./skillGapReport');
const CodingReport = require('./codingReport');
const CommunicationReport = require('./communicationReport');
const PlacementScore = require('./placementScore');

// Relationships
Student.hasMany(ResumeReport, { foreignKey: 'student_id', as: 'resumeReports' });
ResumeReport.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(InterviewReport, { foreignKey: 'student_id', as: 'interviewReports' });
InterviewReport.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(SkillGapReport, { foreignKey: 'student_id', as: 'skillGapReports' });
SkillGapReport.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(CodingReport, { foreignKey: 'student_id', as: 'codingReports' });
CodingReport.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(CommunicationReport, { foreignKey: 'student_id', as: 'communicationReports' });
CommunicationReport.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(PlacementScore, { foreignKey: 'student_id', as: 'placementScores' });
PlacementScore.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

module.exports = {
  sequelize,
  Student,
  ResumeReport,
  InterviewReport,
  SkillGapReport,
  CodingReport,
  CommunicationReport,
  PlacementScore
};
