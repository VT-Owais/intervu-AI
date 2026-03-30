const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const authMiddleware = require('../middleware/authMiddleware');
// const { generateQuestions, evaluateAnswers } = require('../services/geminiService');
const { generateQuestions, evaluateAnswers } = require('../services/groqService');
const InterviewSession = require('../models/InterviewSession');

// Multer config - store in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// @route POST /api/interview/generate
// Generate 15 questions from resume (optional) + topics (optional) — at least one required
router.post('/generate', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const { topics } = req.body;
    let resumeText = '';

    // Parse PDF if uploaded
    if (req.file) {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text.trim();
        if (!resumeText) {
          return res.status(400).json({ message: 'Could not extract text from PDF. Please ensure it is not a scanned image.' });
        }
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr);
        return res.status(400).json({ message: 'Failed to read PDF. Try a different file.' });
      }
    }

    // At least one of resume or topics must be provided
    if (!resumeText && (!topics || !topics.trim())) {
      return res.status(400).json({ message: 'Please upload a resume OR enter at least one topic to generate questions.' });
    }

    // Generate questions using Gemini
    const questions = await generateQuestions(resumeText, topics || '');

    res.json({
      message: 'Questions generated successfully',
      questions,
      resumeText: resumeText.substring(0, 5000)
    });
  } catch (err) {
    console.error('Generate questions error:', err);
    res.status(500).json({ message: err.message || 'Failed to generate questions' });
  }
  console.log("API HIT");
});

// @route POST /api/interview/evaluate
router.post('/evaluate', authMiddleware, async (req, res) => {
  try {
    const { questionsAndAnswers, resumeText, topics, duration } = req.body;

    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers)) {
      return res.status(400).json({ message: 'Invalid Q&A data' });
    }

    const evaluation = await evaluateAnswers(questionsAndAnswers, resumeText || '');

    const session = await InterviewSession.create({
      userId: req.user.userId,
      resumeText: resumeText || '',
      topics: topics || '',
      questions: (evaluation.questions || []).map(q => ({
        question: q.question,
        userAnswer: q.userAnswer,
        modelAnswer: q.modelAnswer,
        score: q.score,
        feedback: q.feedback
      })),
      overallScore: evaluation.overallScore,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      summary: evaluation.summary || '',
      duration: duration || 0
    });

    res.json({
      message: 'Interview evaluated successfully',
      sessionId: session._id,
      evaluation
    });
  } catch (err) {
    console.error('Evaluate error:', err);
    res.status(500).json({ message: err.message || 'Failed to evaluate interview' });
  }
});

module.exports = router;
