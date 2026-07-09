const { CodingReport } = require('../models');
const { callAgent } = require('./aiHelper');

/**
 * AGENT 5: Coding Evaluation Agent
 * Output Schema:
 * {
 *   "correctness_score": number (0-100),
 *   "feedback": string
 * }
 */

const CODING_PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    starterCode: `function twoSum(nums, target) {\n    // Write your code here\n}`
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets and closed in the correct order.",
    starterCode: `function isValid(s) {\n    // Write your code here\n}`
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    starterCode: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n}`
  }
];

async function evaluateCoding(studentId, problemTitle, codeSubmitted) {
  const { computeHash } = require('../utils/hashing');
  const codeHash = computeHash(codeSubmitted);

  // Check cache by hash
  const cachedReport = await CodingReport.findOne({
    where: {
      student_id: studentId,
      code_hash: codeHash
    }
  });

  if (cachedReport) {
    console.log(`[Coding Agent] Cache hit for student ${studentId}. Reusing coding evaluation report.`);
    return {
      reportId: cachedReport.id,
      problem_title: cachedReport.problem_title,
      code_submitted: cachedReport.code_submitted,
      correctness_score: cachedReport.correctness_score,
      feedback: cachedReport.feedback,
      created_at: cachedReport.created_at,
      cached: true
    };
  }

  const systemPrompt = `You are an automated Code Review and Grading Agent.
Analyze the student's JavaScript code submission against the problem title: "${problemTitle}".

YOUR EVALUATION METHODOLOGY (Chain of Thought):
1. Understand the coding problem description and requirements.
2. Read the student's submission. Check syntax correctness.
3. Test edge cases mentally (empty inputs, negative values, large scales, single elements).
4. Evaluate time and space complexity. Verify if it is optimal.
5. Grade correctness out of 100. If there are syntax errors or infinite loops, reduce score significantly.
6. Provide a highly detailed breakdown feedback covering: Complexity, Code Quality, Corner cases, and overall notes.

FEW-SHOT EXAMPLE:
### Input:
Problem Title: "Two Sum"
Submitted Code:
"function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}"

### Output:
{
  "reasoning": "The code correctly solves the Two Sum problem using a nested loop brute force approach. It evaluates all pairs which is correct but inefficient. Time complexity is O(N^2), which is sub-optimal because we can solve this in O(N) using a Hash Map.",
  "correctness_score": 85,
  "feedback": "• Time Complexity: O(N^2) due to nested loops. This can be optimized to O(N) using a Hash Map.\\n• Space Complexity: O(1) as no extra memory is allocated.\\n• Code Quality: Very clean, follows standard naming conventions, syntax is correct.\\n• Corner cases: Handles standard matches, return empty array if no match found.\\n• Recommendation: Use a Map/Object to store visited numbers with their index to achieve linear time complexity."
}

CONSTRAINTS:
- Output only a valid parseable JSON object according to the schema.
- Do not include explanatory text before or after the JSON.`;

  const userPrompt = `Problem Title: "${problemTitle}"\nSubmitted Code:\n\`\`\`javascript\n${codeSubmitted}\n\`\`\``;

  const mockData = {
    correctness_score: 90,
    feedback: `• Time Complexity: O(N) since we perform a single pass over the array using a Hash Map.\n• Space Complexity: O(N) in the worst case to store elements in the hash map.\n• Code Quality: Very good! The use of a JavaScript Object or Map for lookups is optimal and clean. Variable names are self-explanatory.\n• Edge Cases: Handles empty collections or inputs with no matches implicitly, but it is recommended to add explicit check: if (!nums || nums.length < 2) return [];`
  };

  const analysis = await callAgent(systemPrompt, userPrompt, mockData);

  // Write to DB with hash
  const report = await CodingReport.create({
    student_id: studentId,
    problem_title: problemTitle,
    code_hash: codeHash,
    code_submitted: codeSubmitted,
    correctness_score: analysis.correctness_score,
    feedback: analysis.feedback
  });

  return {
    reportId: report.id,
    problem_title: problemTitle,
    code_submitted: codeSubmitted,
    correctness_score: analysis.correctness_score,
    feedback: analysis.feedback,
    created_at: report.created_at,
    cached: false
  };
}

module.exports = {
  evaluateCoding,
  CODING_PROBLEMS
};
