const { CommunicationReport } = require('../models');
const { callAgent } = require('./aiHelper');

/**
 * AGENT 6: Communication Assessment Agent
 * Output Schema:
 * {
 *   "clarity_score": number (0-100),
 *   "grammar_score": number (0-100),
 *   "feedback": string
 * }
 */
async function assessCommunication(studentId, responseText) {
  const systemPrompt = `You are a Professional Communications Coach and English Language Assessor Agent.
Evaluate the student's written response to a situational or behavioral professional prompt.

YOUR EVALUATION METHODOLOGY (Chain of Thought):
1. Analyze the student's written response.
2. Check grammar and syntax accuracy, naming any spelling or punctuation errors.
3. Review clarity, flow of thought, structure, and directness of communication.
4. Assess appropriateness of tone (confident, respectful, clear, cooperative).
5. Assign a clarity_score out of 100.
6. Assign a grammar_score out of 100.
7. Provide three-bullet point feedback highlighting strengths, syntax fixes, and tone recommendations.

FEW-SHOT EXAMPLE:
### Input:
"i want to apply to this job bcoz i have 2 yrs Node js exp and can do good work for you. let me know if u want to chat"

### Output:
{
  "reasoning": "The response is overly informal, contains modern acronyms ('bcoz', 'u', 'exp'), lacks proper capitalization and structure. However, the candidate specifies their main asset (2 years Node.js experience) directly.",
  "clarity_score": 60,
  "grammar_score": 45,
  "feedback": "• Grammatical errors: Missing capitalization for the pronoun 'I', use of chat acronyms ('bcoz' instead of 'because', 'u' instead of 'you', 'exp' instead of 'experience').\\n• Clarity: The core message (2 years experience, wanting to chat) is understood, but the lacks structure.\\n• Tone: Unprofessional, casual. Ensure proper business greetings (e.g. 'Dear Hiring Manager') and a polished signoff."
}

CONSTRAINTS:
- Output only a valid parseable JSON object according to the schema.
- Do not include explanatory text before or after the JSON.`;

  const userPrompt = `Student Written Response:\n"""\n${responseText}\n"""`;

  const mockData = {
    clarity_score: 80,
    grammar_score: 85,
    feedback: `• Grammatical Check: Generally sound syntax and correct use of past tense. Watch out for a run-on sentence in paragraph 2.\n• Clarity: Clear intent; the candidate details why they deserve the role. To make it punchier, reduce auxiliary verbs (e.g. 'I was hoping to expand' could be 'I expanded').\n• Tone: Very polite and open. Could project a bit more authority by replacing phrases like 'I think I am good at' with 'I have verified expertise in'.`
  };

  const analysis = await callAgent(systemPrompt, userPrompt, mockData);

  // Write to DB
  const report = await CommunicationReport.create({
    student_id: studentId,
    response_text: responseText,
    clarity_score: analysis.clarity_score,
    grammar_score: analysis.grammar_score,
    feedback: analysis.feedback
  });

  return {
    reportId: report.id,
    response_text: responseText,
    clarity_score: analysis.clarity_score,
    grammar_score: analysis.grammar_score,
    feedback: analysis.feedback,
    created_at: report.created_at
  };
}

module.exports = { assessCommunication };
