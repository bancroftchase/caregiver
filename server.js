const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

const GEMINI_API_KEY = "AIzaSyChNjhKSB5P0TYpFdJxxLrTqbrvfQdl-GU";

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';"
  );
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/chat.html', async (req, res) => {
  const userPrompt = req.query.query;
  if (!userPrompt) return res.status(400).send('Missing query parameter.');

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Give a list of 50 beauty products about: ${userPrompt}. Format as bullet points with product name and description.` }] }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).send('⚠️ Gemini API returned no usable content.');
    } else {
      res.send(text);
    }
  } catch (err) {
    console.error('❌ Gemini API ERROR:', err);
    res.status(500).send('Error communicating with Gemini API.');
  }
});

app.get('*', (req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
