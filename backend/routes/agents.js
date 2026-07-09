const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');

const { reviewResume } = require('../agents/resumeReviewAgent');
const { generateInterviewQuestion, evaluateInterviewAnswer } = require('../agents/mockInterviewAgent');
const { analyzeSkillGap } = require('../agents/skillGapAgent');
const { evaluateCoding, CODING_PROBLEMS } = require('../agents/codingEvalAgent');
const { assessCommunication } = require('../agents/communicationAgent');
const { authenticateToken } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 1. Resume Review
router.post('/resume-review', authenticateToken, upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    
    if (req.file) {
      const parsedPdf = await pdf(req.file.buffer);
      resumeText = parsedPdf.text;
    }

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text or PDF file is required' });
    }

    const report = await reviewResume(req.studentId, resumeText);
    res.json(report);
  } catch (error) {
    console.error('Resume evaluation error:', error);
    res.status(500).json({ error: 'Failed to process resume review', details: error.message });
  }
});

// 2. Mock Interview - Generate Question
router.get('/mock-interview/question', authenticateToken, async (req, res) => {
  try {
    const { targetRole } = req.query;
    const question = await generateInterviewQuestion(targetRole);
    res.json({ question });
  } catch (error) {
    console.error('Generate question error:', error);
    res.status(500).json({ error: 'Failed to generate interview question', details: error.message });
  }
});

// 3. Mock Interview - Evaluate Answer
router.post('/mock-interview', authenticateToken, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const report = await evaluateInterviewAnswer(req.studentId, question, answer);
    res.json(report);
  } catch (error) {
    console.error('Interview evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate interview answer', details: error.message });
  }
});

// 4. Skill Gap Analysis
router.post('/skill-gap', authenticateToken, async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;
    if (!targetRole || !currentSkills) {
      return res.status(400).json({ error: 'Target role and current skills are required' });
    }

    const report = await analyzeSkillGap(req.studentId, targetRole, currentSkills);
    res.json(report);
  } catch (error) {
    console.error('Skill gap error:', error);
    res.status(500).json({ error: 'Failed to analyze skill gap', details: error.message });
  }
});

// 5. Coding Problems List
router.get('/coding-eval/problems', authenticateToken, (req, res) => {
  res.json(CODING_PROBLEMS);
});

// 6. Coding Evaluation
router.post('/coding-eval', authenticateToken, async (req, res) => {
  try {
    const { problemTitle, codeSubmitted } = req.body;
    if (!problemTitle || !codeSubmitted) {
      return res.status(400).json({ error: 'Problem title and code submitted are required' });
    }

    const report = await evaluateCoding(req.studentId, problemTitle, codeSubmitted);
    res.json(report);
  } catch (error) {
    console.error('Coding eval error:', error);
    res.status(500).json({ error: 'Failed to evaluate coding response', details: error.message });
  }
});

// 7. Communication Assessment
router.post('/communication', authenticateToken, async (req, res) => {
  try {
    const { responseText } = req.body;
    if (!responseText) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    const report = await assessCommunication(req.studentId, responseText);
    res.json(report);
  } catch (error) {
    console.error('Communication error:', error);
    res.status(500).json({ error: 'Failed to assess communication', details: error.message });
  }
});

module.exports = router;
