const { ResumeReport } = require('../models');
const { callAgent } = require('./aiHelper');

/**
 * AGENT 2: Resume Review Agent
 * Output Schema:
 * {
 *   "reasoning": string,
 *   "ats_score": number (0-100),
 *   "missing_sections": string[],
 *   "suggestions": string[]
 * }
 */
async function reviewResume(studentId, resumeText) {
  const { computeHash } = require('../utils/hashing');
  const resumeHash = computeHash(resumeText);

  // Check cache by hash
  const cachedReport = await ResumeReport.findOne({
    where: {
      student_id: studentId,
      resume_hash: resumeHash
    }
  });

  if (cachedReport) {
    console.log(`[Resume Agent] Cache hit for student ${studentId}. Reusing resume report.`);
    return {
      reportId: cachedReport.id,
      ats_score: cachedReport.ats_score,
      missing_sections: cachedReport.missing_sections ? cachedReport.missing_sections.split(', ') : [],
      suggestions: cachedReport.suggestions ? cachedReport.suggestions.split('\n') : [],
      created_at: cachedReport.created_at,
      cached: true
    };
  }

  const systemPrompt = `You are a professional Resume Reviewer Agent specializing in ATS (Applicant Tracking Systems) optimization and corporate recruitment.

Please review the candidate's resume text and output a JSON evaluation.

YOUR EVALUATION METHODOLOGY (Chain of Thought):
1. Read the text and identify whether contact details, email, and LinkedIn are present.
2. Verify if sections for Skills, Experience, Education, and Projects exist.
3. Check if experience bullets use action verbs and quantify impact (e.g. increase by X% or save Y hours).
4. Outline gaps and list missing elements.
5. Grade the resume on a scale of 0-100.
6. Provide three detailed suggestions for improvements.

FEW-SHOT EXAMPLE:
### Input:
"John Doe - Backend Developer
Email: john.doe@email.com
Experience:
- Worked on backend services in Node.js
- Helped team write databases
Education: BS in CS"

### Output:
{
  "reasoning": "The resume has basic contact details but lacks links to online profiles (LinkedIn/GitHub). The Experience section uses weak action verbs ('worked', 'helped') and doesn't quantify impact. A Projects section is completely missing, which is critical for developers.",
  "ats_score": 55,
  "missing_sections": ["GitHub/LinkedIn links", "Projects", "Skills List", "Certifications"],
  "suggestions": [
    "Quantify experience: change 'Helped team write databases' to 'Implemented MySQL optimization reducing query times by 20%'.",
    "Add a dedicated Projects section showcasing 2-3 web applications with full stacks.",
    "Add a Skills section listing technical tools (Node.js, databases etc) to pass ATS keyword scans."
  ]
}

CONSTRAINTS:
- Output only a valid parseable JSON object according to the schema.
- Do not include explanatory text before or after the JSON.
- The Suggestions array must have exactly 3 actionable items.`;

  const userPrompt = `Student Resume Text:\n"""\n${resumeText}\n"""`;

  const mockData = {
    reasoning: 'The resume has contact info but lacks GitHub/LinkedIn profiles. The experience bullets lack metrics and action verbs. Projects section is missing.',
    ats_score: 75,
    missing_sections: ['Certifications', 'Key projects with metrics', 'GitHub/LinkedIn links'],
    suggestions: [
      'Quantify your impact using the Google X-Y-Z formula (e.g., Achieved X by doing Y measured by Z).',
      'Add a dedicated Projects section showcasing tech stack, role, and key deliverables.',
      'Refocus summary to target candidate roles by including more industry-relevant keywords.'
    ]
  };

  const analysis = await callAgent(systemPrompt, userPrompt, mockData);

  // Write to DB with hash
  const report = await ResumeReport.create({
    student_id: studentId,
    resume_hash: resumeHash,
    ats_score: analysis.ats_score,
    missing_sections: Array.isArray(analysis.missing_sections) 
      ? analysis.missing_sections.join(', ') 
      : String(analysis.missing_sections),
    suggestions: Array.isArray(analysis.suggestions)
      ? analysis.suggestions.join('\n')
      : String(analysis.suggestions)
  });

  return {
    reportId: report.id,
    ats_score: analysis.ats_score,
    missing_sections: analysis.missing_sections,
    suggestions: analysis.suggestions,
    created_at: report.created_at,
    cached: false
  };
}

module.exports = { reviewResume };
