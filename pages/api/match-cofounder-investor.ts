// API route for Co-founder/Investor Matching using OpenAI
import { NextApiRequest, NextApiResponse } from 'next';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profiles } = req.body; // Array of user profiles
  if (!profiles || !Array.isArray(profiles)) {
    return res.status(400).json({ error: 'Profiles array required' });
  }

  try {
    // Prepare prompt for OpenAI
    const prompt = `Match co-founders and investors based on their profiles. Return the best matches as JSON. Profiles: ${JSON.stringify(profiles)}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const matches = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ matches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to match profiles', details: error });
  }
}
