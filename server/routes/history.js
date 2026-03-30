const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const InterviewSession = require('../models/InterviewSession');

// @route GET /api/history
// Get all sessions for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.userId })
      .select('createdAt overallScore topics duration questions')
      .sort({ createdAt: -1 });

    const formatted = sessions.map(s => ({
      id: s._id,
      date: s.createdAt,
      overallScore: s.overallScore,
      topics: s.topics,
      duration: s.duration,
      questionCount: s.questions.length
    }));

    res.json({ sessions: formatted });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// @route GET /api/history/:id
// Get a specific session's full report
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

// @route DELETE /api/history/:id
// Delete a specific session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await InterviewSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

module.exports = router;
