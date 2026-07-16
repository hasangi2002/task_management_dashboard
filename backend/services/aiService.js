// Calls the free Google Gemini API to expand a rough task idea into a full title,
// description, and suggested phase/priority.

const PHASES = ['Pre Release Campaign', 'Trailer Drop Day', 'Trailer Release', 'Cinema Launch', 'Post Release'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

async function generateTaskDetails({ roughIdea, projectName }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI generation is not configured (missing GEMINI_API_KEY)');
  }

  const prompt = `You are helping an admin at a film social media marketing agency quickly turn a rough task idea into a properly structured task.

Project: "${projectName}"
Rough idea: "${roughIdea}"

Valid phases (pick exactly one): ${PHASES.join(', ')}
Valid priorities (pick exactly one): ${PRIORITIES.join(', ')}

Respond with ONLY a JSON object, no other text, no markdown code fences, no backticks, no explanation. Format exactly like this:
{"title": "short clear task title under 10 words", "details": "2-3 sentence description explaining what needs to be done and why", "phase": "one of the valid phases above", "priority": "one of the valid priorities above"}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
    {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          thinkingConfig: {
            thinkingBudget: 0 // disable "thinking" — we just need a direct JSON answer
          }
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  const data = await response.json();

  // Collect ALL text parts (not just the first), in case the model still
  // returns multiple parts (e.g. leftover thinking text + the real answer).
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const rawText = parts.map(p => p.text || '').join('\n').trim();

  if (!rawText) {
    console.error('Empty Gemini response, full payload:', JSON.stringify(data));
    throw new Error('No text response from AI');
  }

  let parsed;
  try {
    // Try to isolate just the {...} JSON block in case there's stray text around it.
    const match = rawText.match(/\{[\s\S]*\}/);
    const cleaned = match ? match[0] : rawText;
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Gemini output as JSON. Raw text was:', rawText);
    throw new Error('Failed to parse AI response as JSON');
  }

  // Validate/clamp to known values so a bad AI response can't break the form
  if (!PHASES.includes(parsed.phase)) parsed.phase = 'Pre Release Campaign';
  if (!PRIORITIES.includes(parsed.priority)) parsed.priority = 'Medium';
  if (!parsed.title) parsed.title = roughIdea;
  if (!parsed.details) parsed.details = '';

  return parsed;
}

module.exports = { generateTaskDetails };