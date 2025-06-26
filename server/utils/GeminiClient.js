const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-3n-e4b-it:free';

async function enhanceDescription(originalDescription) {
  if (!OPENROUTER_API_KEY) {
    console.warn('Missing OpenRouter API Key.');
    return originalDescription + '\nJoin us for growth opportunities and mentorship programs!';
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: `Improve this job description:\n\n${originalDescription}\n\nMake it clear, exciting, and appealing. Keep it concise and engaging.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const result = response.data?.choices?.[0]?.message?.content;
    return result?.trim() || originalDescription;

  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    return originalDescription + '\nJoin us for growth opportunities and mentorship programs!';
  }
}

module.exports = { enhanceDescription };

