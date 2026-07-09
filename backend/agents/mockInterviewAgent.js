const { InterviewReport } = require('../models');
const { callAgent } = require('./aiHelper');

/**
 * AGENT 3: Mock Interview Agent
 * Tasks:
 * 1. Generate standard technical or behavioral question based on target_role.
 * 2. Evaluate student's answer to a question and write to database.
 */

async function generateInterviewQuestion(targetRole) {
  const systemPrompt = `You are a Senior Technical Recruiter. Your task is to generate a single relevant engineering, technical, or behavioral interview question for a candidate applying for the role of ${targetRole || 'Software Engineer'}.

You must output a JSON object containing the question.

FEW-SHOT EXAMPLE:
### Input role: 
"Frontend Engineer"

### Output:
{
  "question": "Can you explain the difference between client-side rendering (CSR) and server-side rendering (SSR), and in what scenarios you would choose one over the other?"
}

CONSTRAINTS:
- Output only a valid parseable JSON object according to the schema.
- Do not include explanatory text before or after the JSON.
- Provide a single, concise question.`;

  const userPrompt = `Generate one interview question for a target role of: ${targetRole || 'Software Engineer'}.`;

  const mockData = {
    question: `Describe a challenging technical problem you solved recently. What was the setup, what approach did you take, and how did you measure success?`
  };

  const result = await callAgent(systemPrompt, userPrompt, mockData);
  return result.question;
}

async function evaluateInterviewAnswer(studentId, question, answer) {
  const systemPrompt = `You are an Interview Evaluator Agent.
Assess the student's answer to the interview question provided.

YOUR EVALUATION METHODOLOGY (Chain of Thought):
1. Understand the core requirements of the question.
2. Evaluate if the student's answer address the question directly.
3. Check for specific methodology usage like the STAR method (Situation, Task, Action, Result).
4. Evaluate technical correctness, depth, and clarity of the explanations.
5. Provide helpful feedback including specific positive aspects and constructive areas of improvement.
6. Rate the response with a confidence_score between 0-100.

FEW-SHOT EXAMPLE:
### Input:
Question: "Describe a time when you had a conflict with a team member. How did you resolve it?"
Student Answer: "We had a disagreement about database choice. I wanted MySQL, they wanted MongoDB. We talked about it and decided to use MySQL."

### Output:
{
  "reasoning": "The candidate outlines the conflict simply but fails to detail the actual resolution process, criteria used, or the result of collaboration. The STAR method is poorly implemented since the results and tasks are missing.",
  "evaluation": "Your explanation identifies a common technical disagreement. However, you should expand on the active steps you took to hear the other team member's perspective, compare pros/cons, and how the outcome affected the team's dynamics.",
  "confidence_score": 60
}

CONSTRAINTS:
- Output only a valid parseable JSON object according to the schema.
- Do not include explanatory text before or after the JSON.`;

  const userPrompt = `Question: "${question}"\nStudent Answer: "${answer}"`;

  const mockData = {
    reasoning: 'The student structured their response decently, mentioning the context and active steps taken. However, they failed to present clear statistics/metrics of the project outcome.',
    evaluation: 'The student structured their response decently, mentioning the context and active steps taken. However, they failed to present clear statistics/metrics of the project outcome. Recommend the STAR (Situation, Task, Action, Result) method to make the response more structured and impactful.',
    confidence_score: 72
  };

  const analysis = await callAgent(systemPrompt, userPrompt, mockData);

  // Write to DB
  const report = await InterviewReport.create({
    student_id: studentId,
    question,
    answer,
    evaluation: analysis.evaluation,
    confidence_score: analysis.confidence_score
  });

  return {
    reportId: report.id,
    question,
    answer,
    evaluation: analysis.evaluation,
    confidence_score: analysis.confidence_score,
    created_at: report.created_at
  };
}

module.exports = {
  generateInterviewQuestion,
  evaluateInterviewAnswer
};
