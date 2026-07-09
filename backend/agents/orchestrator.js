const { PlacementScore, CodingReport } = require('../models');
const { reviewResume } = require('./resumeReviewAgent');
const { evaluateInterviewAnswer } = require('./mockInterviewAgent');
const { analyzeSkillGap } = require('./skillGapAgent');
const { evaluateCoding } = require('./codingEvalAgent');
const { assessCommunication } = require('./communicationAgent');
const { callAgent } = require('./aiHelper');

/**
 * AGENT 1: Central Orchestrator Agent
 * Coordinates other agents, calculates final placement readiness score,
 * generates 30-day plan, and writes to database.
 */
async function evaluateStudentPlacementReadiness(studentId, data) {
  const {
    resumeText,
    targetRole,
    currentSkills,
    interviewQuestion,
    interviewAnswer,
    codingProblemTitle,
    codeSubmitted,
    communicationResponseText
  } = data;

  console.log(`[Orchestrator] Starting placement evaluation for student ${studentId} targeting ${targetRole}...`);

  // 1. Run all 5 specialist agents in parallel
  const [
    resumeResult,
    interviewResult,
    skillGapResult,
    codingResult,
    communicationResult
  ] = await Promise.all([
    reviewResume(studentId, resumeText || 'No resume uploaded.'),
    evaluateInterviewAnswer(studentId, interviewQuestion || 'No interview question.', interviewAnswer || 'No answer submitted.'),
    analyzeSkillGap(studentId, targetRole || 'Software Engineer', currentSkills || 'None listed.'),
    evaluateCoding(studentId, codingProblemTitle || 'Unknown Problem', codeSubmitted || '// No code submitted.'),
    assessCommunication(studentId, communicationResponseText || 'No communication text submitted.')
  ]);

  // 2. Fetch coding consistency (calculate based on count of previous coding reports)
  // Let's compute a consistency score:
  // If the student has submitted 1 code, 50 points; 2 codes, 75 points; 3+ codes, 100 points.
  const codingSubmissionsCount = await CodingReport.count({ where: { student_id: studentId } });
  let codingConsistencyScore = 30; // Default baseline
  if (codingSubmissionsCount === 1) codingConsistencyScore = 60;
  else if (codingSubmissionsCount === 2) codingConsistencyScore = 80;
  else if (codingSubmissionsCount >= 3) codingConsistencyScore = 100;

  // 3. Compute weight scores (0-100 range)
  const resume_weight_score = resumeResult.ats_score;
  const interview_weight_score = interviewResult.confidence_score;
  
  // Calculate skill gap score: base 100, lose 15 points per missing skill, min 30
  const missingCount = Array.isArray(skillGapResult.missing_skills) ? skillGapResult.missing_skills.length : 3;
  const skill_weight_score = Math.max(30, 100 - (missingCount * 15));

  // Coding weight score integrates the coding evaluation (60% weight) and consistency (40% weight)
  const codingEvalScore = codingResult.correctness_score;
  const coding_weight_score = Math.round((codingEvalScore * 0.6) + (codingConsistencyScore * 0.4));

  // Communication score is the average of clarity and grammar scores
  const communication_weight_score = Math.round(
    (communicationResult.clarity_score + communicationResult.grammar_score) / 2
  );

  // 4. Calculate overall Placement Readiness Score (0-100)
  // Technical (coding 25% + skill gap 15%): 40%
  // Communication: 20%
  // Resume quality: 15%
  // Coding consistency: 15% (Wait, since we calculated consistency and coding, let's apply the weights directly:
  //   overall_score = (resume * 0.15) + (interview * 0.10) + (skill * 0.15) + (codingEval * 0.25) + (consistency * 0.15) + (communication * 0.20)
  // )
  const overall_score = Math.round(
    (resume_weight_score * 0.15) +
    (interview_weight_score * 0.10) +
    (skill_weight_score * 0.15) +
    (codingEvalScore * 0.25) +
    (codingConsistencyScore * 0.15) +
    (communication_weight_score * 0.20)
  );

  console.log(`[Orchestrator] Scoring breakdown for Student ${studentId}:
    - Resume Quality: ${resume_weight_score} (Weight: 15%)
    - Mock Interview: ${interview_weight_score} (Weight: 10%)
    - Skill Gap: ${skill_weight_score} (Weight: 15%)
    - Coding Eval: ${codingEvalScore} (Weight: 25%)
    - Coding Consistency: ${codingConsistencyScore} (Weight: 15%)
    - Communication: ${communication_weight_score} (Weight: 20%)
    => OVERALL PLACEABILITY SCORE: ${overall_score}`);

  // 5. Generate a 30-Day Personalized Roadmap using Claude
  const systemPrompt = `You are a Career Accelerator and Technical Mentor Orchestrator.
Based on the candidate's placement test scores and detailed gap findings, generate a highly custom 30-day career roadmap.

FEW-SHOT EXAMPLE:
### Input:
Generate roadmap for target role "Backend Engineer" with:
- Resume ATS Score: 55/100
- High Priority Skill Gaps: ["Relational Databases & ORM (Sequelize)"]
- Coding Score: 85/100
- Interview Score: 60/100
- Communication Score: 50/100

### Output:
{
  "weeks": [
    {
      "week": 1,
      "focus": "Resume Alignment & Core Databases",
      "tasks": [
        "Revise resume to add SQL/Sequelize metrics for projects.",
        "Enroll in a database optimization tutorial with focus on MySQL indexing."
      ]
    },
    {
      "week": 2,
      "focus": "Coding Interview Practice & ORM",
      "tasks": [
        "Solve 10 Medium coding exercises on Hash Maps and Arrays on LeetCode.",
        "Implement a Node.js project demonstrating Sequelize relationships."
      ]
    },
    {
      "week": 3,
      "focus": "Mock Interview Tactics & Behavioral Prep",
      "tasks": [
        "Record yourself answering 3 behavioral questions using the STAR framework.",
        "Mock interview practice on backend systems design fundamentals."
      ]
    },
    {
      "week": 4,
      "focus": "Polishing Communication & Career Applications",
      "tasks": [
        "Practice summarizing projects in under 2 minutes for business audiences.",
        "Apply to 5 backend developer positions using your updated ATS-friendly resume."
      ]
    }
  ]
}

CONSTRAINTS:
- Provide exactly 4 weeks segment in the weeks array.
- Tasks must be highly actionable, referencing the candidate's custom findings and scores.
- Return only raw valid JSON matching the schema. No markdown formatting.`;

  const userPrompt = `
Generate a 30-day roadmap for a user targeting "${targetRole}" with the following evaluation findings:
- Resume ATS Score: ${resume_weight_score}/100. Issues: ${JSON.stringify(resumeResult.missing_sections)}.
- High Priority Skill Gaps: ${JSON.stringify(skillGapResult.missing_skills)}.
- Coding Evaluation Score: ${codingEvalScore}/100. Feedback: ${codingResult.feedback}
- Mock Interview Score: ${interview_weight_score}/100. Feedback: ${interviewResult.evaluation}
- Communication Score: ${communication_weight_score}/100.
  `;

  const mockRoadmap = {
    weeks: [
      {
        week: 1,
        focus: "Resume Revamp and Core Skill Alignment",
        tasks: [
          `Re-write resume and fix missing layouts: ${resumeResult.missing_sections.slice(0, 2).join(', ')}.`,
          `Begin self-study on key skill gap: ${skillGapResult.missing_skills[0] || 'System Design'}.`
        ]
      },
      {
        week: 2,
        focus: "Data Structures, Algorithms & Code Optimization",
        tasks: [
          "Practice 3 LeetCode Medium problems daily focus on optimization and hash maps.",
          `Implement a mini project utilizing ${skillGapResult.missing_skills[1] || 'TypeScript'}.`
        ]
      },
      {
        week: 3,
        focus: "Behavioral Communication & System Architecture",
        tasks: [
          "Format study templates for behavioral questions using the STAR interview framework.",
          "Perform a mock whiteboard architectural design walkthrough with video recording."
        ]
      },
      {
        week: 4,
        focus: "ATS Testing & Target Applications",
        tasks: [
          "Upload final polished resume to scanner tools to verify ATS score is >85.",
          "Apply to 5 high-yield roles per day and track with a personalized spreadsheet."
        ]
      }
    ]
  };

  const roadmapData = await callAgent(systemPrompt, userPrompt, mockRoadmap);

  // 6. Write final row to placement_scores
  const placementScore = await PlacementScore.create({
    student_id: studentId,
    overall_score,
    resume_weight_score,
    interview_weight_score,
    skill_weight_score,
    coding_weight_score, // Stored as combined coding + consistency score
    communication_weight_score,
    roadmap: JSON.stringify(roadmapData)
  });

  return {
    placementScoreId: placementScore.id,
    overall_score,
    breakdown: {
      resume: resume_weight_score,
      interview: interview_weight_score,
      skill_gap: skill_weight_score,
      coding_eval: codingEvalScore,
      coding_consistency: codingConsistencyScore,
      coding_combined: coding_weight_score,
      communication: communication_weight_score
    },
    roadmap: roadmapData,
    generated_at: placementScore.generated_at
  };
}

module.exports = { evaluateStudentPlacementReadiness };
