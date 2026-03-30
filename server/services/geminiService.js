const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Generate 15 interview questions based on resume text and/or topics
const generateQuestions = async (resumeText, topics) => {
  const hasResume = resumeText && resumeText.trim().length > 0;
  const hasTopics = topics && topics.trim().length > 0;

  let contextSection = '';
  if (hasResume && hasTopics) {
    contextSection = `Resume/Profile Information:\n${resumeText}\n\nFocus especially on these topics: ${topics}.`;
  } else if (hasResume) {
    contextSection = `Resume/Profile Information:\n${resumeText}`;
  } else {
    contextSection = `Topics to focus on: ${topics}`;
  }

  const prompt = `You are an expert technical interviewer. Generate exactly 15 important interview questions based on the following context.

${contextSection}

Requirements:
- Generate exactly 15 questions
- Mix of technical, behavioral, and situational questions
- Questions should be relevant to the context provided
- Range from easy to difficult
- Make them realistic interview questions a hiring manager would ask

Return ONLY a valid JSON array of exactly 15 question strings, no extra text, no markdown, no code blocks:
["Question 1", "Question 2", ..., "Question 15"]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  // Parse JSON
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse questions from AI response');
  
  const questions = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(questions) || questions.length !== 15) {
    throw new Error('AI did not return exactly 15 questions');
  }
  
  return questions;
};

// Evaluate all answers and provide detailed feedback
const evaluateAnswers = async (questionsAndAnswers, resumeText) => {
  const qaText = questionsAndAnswers.map((qa, i) => 
    `Q${i+1}: ${qa.question}\nAnswer: ${qa.answer || '(No answer provided)'}`
  ).join('\n\n');

  const prompt = `You are an expert interview coach evaluating a candidate's interview performance.

Candidate Background (from resume):
${resumeText}

Interview Q&A:
${qaText}

Evaluate each answer and provide comprehensive feedback. Return ONLY valid JSON (no markdown, no code blocks):

{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence overall performance summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "questions": [
    {
      "question": "<question text>",
      "userAnswer": "<user's answer>",
      "score": <number 0-10>,
      "feedback": "<specific feedback on this answer>",
      "modelAnswer": "<ideal answer for this question>"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  // Extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse evaluation from AI response');
  
  return JSON.parse(jsonMatch[0]);
};

module.exports = { generateQuestions, evaluateAnswers };
