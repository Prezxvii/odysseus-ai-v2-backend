const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OpenRouter API key not configured on the server.' });
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    const openRouterResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const aiText = openRouterResponse.data.choices[0].message.content;

    let suggestions = [];
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('ideal self')) {
      suggestions = ['How do I define my ideal self?', 'Can you give me examples of traits?', 'How do I assess my current traits?'];
    } else if (lowerCaseMessage.includes('pick a role') || lowerCaseMessage.includes('choose a role')) {
      suggestions = ['Suggest some roles for me.', "What's involved in being an entrepreneur?", 'How do I know which role is right?'];
    } else if (lowerCaseMessage.includes('odysseus capable') || lowerCaseMessage.includes('what can you do')) {
      suggestions = ['Tell me more about the assessment.', 'How does the roadmap work?', 'Can I track my progress?'];
    } else if (lowerCaseMessage.includes('start journey') || lowerCaseMessage.includes('begin')) {
      suggestions = ["I want to be an entrepreneur.", "I want to improve my leadership skills.", "Help me discover my purpose."];
    } else {
      suggestions = ['Tell me more about the journey.', 'What are the next steps?', 'How do I define a goal?'];
    }

    res.json({ text: aiText, suggestions: suggestions });

  } catch (error) {
    console.error('Error calling OpenRouter API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to get a response from the AI. Please try again.' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Odysseus AI Backend server running on http://localhost:${PORT}`);
});