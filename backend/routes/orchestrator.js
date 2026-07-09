const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { evaluateStudentPlacementReadiness } = require('../agents/orchestrator');
const { authenticateToken } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/orchestrator/evaluate
// Authentication is required
router.post('/evaluate', authenticateToken, upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    
    // If a PDF is uploaded, parse it and extract the raw text
    if (req.file) {
      console.log(`[Orchestrator Route] Received PDF file: ${req.file.originalname}. Parsing...`);
      try {
        const parsedPdf = await pdf(req.file.buffer);
        resumeText = parsedPdf.text;
      } catch (pdfError) {
        console.error('[Orchestrator Route] Error parsing PDF resume:', pdfError.message);
        return res.status(400).json({ error: 'Failed to parse resume PDF. Please check file format.' });
      }
    }

    const payload = {
      resumeText,
      targetRole: req.body.targetRole,
      currentSkills: req.body.currentSkills,
      interviewQuestion: req.body.interviewQuestion,
      interviewAnswer: req.body.interviewAnswer,
      codingProblemTitle: req.body.codingProblemTitle,
      codeSubmitted: req.body.codeSubmitted,
      communicationResponseText: req.body.communicationResponseText
    };

    console.log('[Orchestrator Route] Triggering full package evaluation workflow.');
    
    const evaluationResults = await evaluateStudentPlacementReadiness(req.studentId, payload);
    
    res.json({
      message: 'Evaluation pipeline completed successfully.',
      data: evaluationResults
    });
  } catch (error) {
    console.error('[Orchestrator Route] Pipeline failed:', error);
    res.status(500).json({ 
      error: 'An internal error occurred during the orchestration assessment.',
      details: error.message 
    });
  }
});

module.exports = router;
