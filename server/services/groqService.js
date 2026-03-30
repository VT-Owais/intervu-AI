const Groq = require("groq-sdk");

const TOTAL_QUESTIONS = 5;

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Generate questions
const generateQuestions = async (resumeText, topics) => {
    const prompt = `
You are an AI that ONLY returns valid JSON.

Generate exactly ${TOTAL_QUESTIONS} interview questions.

Context:
Resume: ${resumeText}
Topics: ${topics}

STRICT RULES:
- Return ONLY a JSON object
- The object must have a single key "questions" containing an array of strings
- No explanation
- No markdown
- No text before or after

Example:
Generate exactly ${TOTAL_QUESTIONS} interview questions
`;

    const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
    });

    const text = response.choices[0].message.content;

    try {
        const parsed = JSON.parse(text);
        // We MUST return the array itself so the frontend React component can map over it!
        return parsed.questions || [];
    } catch {
        // Strip markdown backticks if model ignored instructions
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const match = cleanText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Failed to parse");
        const parsed = JSON.parse(match[0]);
        return parsed.questions || [];
    }
};

// Evaluate answers
const evaluateAnswers = async (questionsAndAnswers, resumeText) => {
    const prompt = `
You are an AI that ONLY returns valid JSON.

Evaluate the following interview answers.

Resume:
${resumeText}

Q&A:
${JSON.stringify(questionsAndAnswers)}

STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No text before or after
- Use proper commas
- Use double quotes
- "strengths" must contain at least 2-3 specific positive points about the user's answers. You must invent them based on their performance if needed, do not leave blank! Give suggestions.
- "improvements" must contain at least 2-3 specific areas they can improve on. You must give suggestions based on performance, do not leave blank!

Return STRICT JSON in this exact format:

{
  "overallScore": number,
  "summary": "text",
  "strengths": ["text"],
  "improvements": ["text"],
  "questions": [
    {
      "question": "text",
      "userAnswer": "text",
      "score": number,
      "feedback": "text",
      "modelAnswer": "text"
    }
  ]
}
`;

    const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
    });

    const text = response.choices[0].message.content;

    try {
        return JSON.parse(text);
    } catch {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const match = cleanText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Failed to parse");
        return JSON.parse(match[0]);
    }
};

module.exports = { generateQuestions, evaluateAnswers };