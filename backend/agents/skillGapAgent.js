const { SkillGapReport } = require('../models');
const { callAgent } = require('./aiHelper');

/**
 * AGENT 4: Skill Gap Analysis Agent
 * Output Schema:
 * {
 *   "reasoning": string,
 *   "missing_skills": string[]
 * }
 */
async function analyzeSkillGap(studentId, targetRole, currentSkills) {
  const systemPrompt = `You are a Career Counselor and Tech Industry Analyst Agent.
Compare the candidate's current skill set with the standard industry requirements for their target role.

YOUR EVALUATION METHODOLOGY (Chain of Thought):
1. Understand the core skills, frameworks, and technologies required for the target role (e.g. Frontend, Backend, DevOps, Data Science).
2. Read the candidate's current skill list.
3. Identify which critical skills or toolsets are missing from the candidate's list.
4. Rank the missing skills in order of priority (most critical gap first).
5. Output the ranked list in a JSON array.

FEW-SHOT EXAMPLE:
### Input:
Target Role: "Full Stack Developer"
Candidate's Current Skills: "JavaScript, HTML, CSS, React, Node.js"

### Output:
{
  "reasoning": "The candidate has solid foundational skills for frontend development and basic backend. However, they lack devops/deployment skills (Docker, CI/CD), advanced state management (Redux/Zustand), database query optimization/ORM experience (SQL/Sequelize/NoSQL), and testing libraries.",
  "missing_skills": [
    "Relational Databases & ORM (MySQL/PostgreSQL, Sequelize)",
    "Docker Containerization",
    "CI/CD Pipelines (GitHub Actions)",
    "React Advanced State Management (Zustand/Redux Toolkit)",
    "Testing Libraries (Jest / React Testing Library)"
  ]
}

CONSTRAINTS:
- Output only a valid parseable JSON object according to the schema.
- Do not include explanatory text before or after the JSON.`;

  const userPrompt = `Target Role: "${targetRole}"\nCandidate's Current Skills: "${currentSkills}"`;

  const mockData = {
    reasoning: 'The candidate is missing crucial cloud and devops skills as well as databases for a standard node developer.',
    missing_skills: [
      'Next.js (Server-Side Rendering principles)',
      'TypeScript (Strong typing, interfaces, custom generics)',
      'System Design (RESTful APIs, caching, relational vs non-relational DB design)',
      'CI/CD Pipelines (GitHub Actions, Docker containerization Basics)'
    ]
  };

  const analysis = await callAgent(systemPrompt, userPrompt, mockData);

  // Write to DB
  const report = await SkillGapReport.create({
    student_id: studentId,
    target_role: targetRole,
    missing_skills: Array.isArray(analysis.missing_skills) 
      ? analysis.missing_skills.join(', ') 
      : String(analysis.missing_skills)
  });

  return {
    reportId: report.id,
    target_role: targetRole,
    missing_skills: analysis.missing_skills,
    created_at: report.created_at
  };
}

module.exports = { analyzeSkillGap };
