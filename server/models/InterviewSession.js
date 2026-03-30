const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  modelAnswer: String,
  score: Number,
  feedback: String
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeText: String,
  topics: String,
  questions: [questionSchema],
  overallScore: Number,
  strengths: [String],
  improvements: [String],
  summary: String,
  duration: Number, // in seconds
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
