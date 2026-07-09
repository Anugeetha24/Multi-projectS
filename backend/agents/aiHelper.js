const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';

let anthropic = null;
if (apiKey) {
  try {
    anthropic = new Anthropic({ apiKey });
  } catch (error) {
    console.error('Failed to initialize Anthropic client:', error.message);
  }
}

/**
 * Calls Anthropic Claude and parses its output as JSON.
 * Falls back to mockData if API key is missing or call fails.
 */
async function callAgent(systemPrompt, userPrompt, mockData) {
  if (!anthropic) {
    console.log('[AI Agent Helper] No ANTHROPIC_API_KEY found, using mock data response.');
    return varyMockData(mockData);
  }

  const maxRetries = 1; // Retry-once logic
  let attempt = 0;

  while (attempt <= maxRetries) {
    let timeoutId;
    try {
      console.log(`[AI Agent Helper] Sending request to Claude API (Attempt ${attempt + 1}/${maxRetries + 1})...`);
      
      // We implement a 30-second timeout using Promise.race
      const response = await Promise.race([
        anthropic.messages.create({
          model: model,
          max_tokens: 4000,
          temperature: 0.1,
          system: `${systemPrompt}\n\nIMPORTANT: You must output ONLY a valid parseable JSON object matching the requested schema. Do not output any markdown formatting like \`\`\`json, do not prefix with explanations. Output only raw JSON.`,
          messages: [{ role: 'user', content: userPrompt }]
        }),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Request timeout: Claude API took longer than 30 seconds.'));
          }, 30000);
        })
      ]);

      // Clear the timeout if the call succeeded
      if (timeoutId) clearTimeout(timeoutId);

      const textContent = response.content[0].text;
      console.log('[AI Agent Helper] Received response text.');
      
      let cleaned = textContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      }

      return JSON.parse(cleaned);
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error(`[AI Agent Helper] Attempt ${attempt + 1} failed:`, error.message);
      
      attempt++;
      if (attempt > maxRetries) {
        console.error('[AI Agent Helper] All Claude API attempts failed. Falling back to mock data.');
        return varyMockData(mockData);
      }
      
      console.log(`[AI Agent Helper] Triggering retry-once for Claude API...`);
    }
  }
}

function varyMockData(mockData) {
  // If mockData has numeric scores, vary them slightly to simulate interactive scoring
  const copy = JSON.parse(JSON.stringify(mockData));
  
  const modifyScores = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'number') {
        // Vary score by -5 to +5, keeping within 0-100 range
        const change = Math.floor(Math.random() * 11) - 5;
        obj[key] = Math.max(0, Math.min(100, obj[key] + change));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        modifyScores(obj[key]);
      }
    }
  };

  modifyScores(copy);
  return copy;
}

module.exports = {
  callAgent,
  isMockMode: !anthropic
};
