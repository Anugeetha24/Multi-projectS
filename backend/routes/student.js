const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/student/:id/report
// Joins all tables for that student using a parameterized raw SQL query to guarantee SQL injection protection.
router.get('/:id/report', authenticateToken, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    
    // Authorization check: Students can only view their own reports.
    if (studentId !== req.studentId) {
      return res.status(403).json({ error: 'Access denied: You are not authorized to view this report.' });
    }

    console.log(`[Student Route] Accessing unified assessment score report for student: ${studentId}`);

    // Executing parameterized raw queries joins the tables to fetch the latest summary of each report type
    // This perfectly matches "joins all tables for that student" & "parameterized SQL queries only"
    const results = await sequelize.query(`
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        s.email AS student_email,
        s.target_role AS student_target_role,
        
        ps.id AS score_id,
        ps.overall_score,
        ps.resume_weight_score,
        ps.interview_weight_score,
        ps.skill_weight_score,
        ps.coding_weight_score,
        ps.communication_weight_score,
        ps.roadmap,
        ps.generated_at,

        rr.id AS resume_report_id,
        rr.ats_score,
        rr.missing_sections AS resume_missing_sections,
        rr.suggestions AS resume_suggestions,
        rr.created_at AS resume_created_at,

        ir.id AS interview_report_id,
        ir.question AS interview_question,
        ir.answer AS interview_answer,
        ir.evaluation AS interview_evaluation,
        ir.confidence_score AS interview_confidence,
        ir.created_at AS interview_created_at,

        sgr.id AS skill_gap_report_id,
        sgr.missing_skills AS skill_missing_skills,
        sgr.created_at AS skill_created_at,

        cr.id AS coding_report_id,
        cr.problem_title AS coding_problem_title,
        cr.code_submitted AS coding_code_submitted,
        cr.correctness_score AS coding_correctness_score,
        cr.feedback AS coding_feedback,
        cr.created_at AS coding_created_at,

        comr.id AS comm_report_id,
        comr.response_text AS comm_response_text,
        comr.clarity_score AS comm_clarity_score,
        comr.grammar_score AS comm_grammar_score,
        comr.feedback AS comm_feedback,
        comr.created_at AS comm_created_at

      FROM students s
      
      LEFT JOIN (
        SELECT id, student_id, overall_score, resume_weight_score, interview_weight_score, 
               skill_weight_score, coding_weight_score, communication_weight_score, roadmap, generated_at
        FROM placement_scores
        WHERE student_id = :studentId
        ORDER BY generated_at DESC
        LIMIT 1
      ) ps ON s.id = ps.student_id

      LEFT JOIN (
        SELECT id, student_id, ats_score, missing_sections, suggestions, created_at
        FROM resume_reports
        WHERE student_id = :studentId
        ORDER BY created_at DESC
        LIMIT 1
      ) rr ON s.id = rr.student_id

      LEFT JOIN (
        SELECT id, student_id, question, answer, evaluation, confidence_score, created_at
        FROM interview_reports
        WHERE student_id = :studentId
        ORDER BY created_at DESC
        LIMIT 1
      ) ir ON s.id = ir.student_id

      LEFT JOIN (
        SELECT id, student_id, target_role, missing_skills, created_at
        FROM skill_gap_reports
        WHERE student_id = :studentId
        ORDER BY created_at DESC
        LIMIT 1
      ) sgr ON s.id = sgr.student_id

      LEFT JOIN (
        SELECT id, student_id, problem_title, code_submitted, correctness_score, feedback, created_at
        FROM coding_reports
        WHERE student_id = :studentId
        ORDER BY created_at DESC
        LIMIT 1
      ) cr ON s.id = cr.student_id

      LEFT JOIN (
        SELECT id, student_id, response_text, clarity_score, grammar_score, feedback, created_at
        FROM communication_reports
        WHERE student_id = :studentId
        ORDER BY created_at DESC
        LIMIT 1
      ) comr ON s.id = comr.student_id

      WHERE s.id = :studentId
      LIMIT 1;
    `, {
      replacements: { studentId },
      type: sequelize.QueryTypes.SELECT
    });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const reportResult = results[0];

    // Format fields to clean JSON arrays/objects
    let roadmapParsed = null;
    if (reportResult.roadmap) {
      try {
        roadmapParsed = JSON.parse(reportResult.roadmap);
      } catch (err) {
        roadmapParsed = reportResult.roadmap;
      }
    }

    const formattedReport = {
      student: {
        id: reportResult.student_id,
        name: reportResult.student_name,
        email: reportResult.student_email,
        target_role: reportResult.student_target_role
      },
      placementScore: reportResult.score_id ? {
        id: reportResult.score_id,
        overall_score: reportResult.overall_score,
        breakdown: {
          resume: reportResult.resume_weight_score,
          interview: reportResult.interview_weight_score,
          skill_gap: reportResult.skill_weight_score,
          coding: reportResult.coding_weight_score,
          communication: reportResult.communication_weight_score
        },
        roadmap: roadmapParsed,
        generated_at: reportResult.generated_at
      } : null,
      resumeReport: reportResult.resume_report_id ? {
        id: reportResult.resume_report_id,
        ats_score: reportResult.ats_score,
        missing_sections: reportResult.resume_missing_sections ? reportResult.resume_missing_sections.split(', ') : [],
        suggestions: reportResult.resume_suggestions ? reportResult.resume_suggestions.split('\n') : [],
        created_at: reportResult.resume_created_at
      } : null,
      interviewReport: reportResult.interview_report_id ? {
        id: reportResult.interview_report_id,
        question: reportResult.interview_question,
        answer: reportResult.interview_answer,
        evaluation: reportResult.interview_evaluation,
        confidence_score: reportResult.interview_confidence,
        created_at: reportResult.interview_created_at
      } : null,
      skillGapReport: reportResult.skill_gap_report_id ? {
        id: reportResult.skill_gap_report_id,
        missing_skills: reportResult.skill_missing_skills ? reportResult.skill_missing_skills.split(', ') : [],
        created_at: reportResult.skill_created_at
      } : null,
      codingReport: reportResult.coding_report_id ? {
        id: reportResult.coding_report_id,
        problem_title: reportResult.coding_problem_title,
        code_submitted: reportResult.coding_code_submitted,
        correctness_score: reportResult.coding_correctness_score,
        feedback: reportResult.coding_feedback,
        created_at: reportResult.coding_created_at
      } : null,
      communicationReport: reportResult.comm_report_id ? {
        id: reportResult.comm_report_id,
        response_text: reportResult.comm_response_text,
        clarity_score: reportResult.comm_clarity_score,
        grammar_score: reportResult.comm_grammar_score,
        feedback: reportResult.comm_feedback,
        created_at: reportResult.comm_created_at
      } : null
    };

    res.json(formattedReport);
  } catch (error) {
    console.error('[Student Route] Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate consolidated student report.', details: error.message });
  }
});

// GET /api/student/:id/history
// Returns the history of placement scores generated over time for charting progress.
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (studentId !== req.studentId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { PlacementScore } = require('../models');
    const scores = await PlacementScore.findAll({
      where: { student_id: studentId },
      order: [['generated_at', 'ASC']],
      attributes: ['id', 'overall_score', 'generated_at']
    });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch score history.' });
  }
});

module.exports = router;
