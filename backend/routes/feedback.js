const express = require('express');
const { body, validationResult } = require('express-validator');
const Sentiment = require('sentiment');
const Feedback = require('../models/Feedback');
const { studentAuth } = require('../middleware/auth');

const router = express.Router();
const sentiment = new Sentiment();

// Submit feedback (students only)
router.post('/submit', studentAuth, [
  body('feedback')
    .notEmpty()
    .withMessage('Feedback is required')
    .isLength({ max: 1000 })
    .withMessage('Feedback must be less than 1000 characters'),
  body('type')
    .isIn(['College', 'Faculty', 'Campus', 'Syllabus', 'Other'])
    .withMessage('Invalid feedback type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check attendance requirement
    if (req.user.attendancePercentage < 75) {
      return res.status(403).json({ 
        message: 'You must have at least 75% attendance to submit feedback',
        attendancePercentage: req.user.attendancePercentage
      });
    }

    const { feedback, type } = req.body;

    // Perform sentiment analysis
    const sentimentResult = sentiment.analyze(feedback);
    
    // Determine sentiment label based on score
    let label;
    if (sentimentResult.score > 0) {
      label = 'positive';
    } else if (sentimentResult.score < 0) {
      label = 'negative';
    } else {
      label = 'neutral';
    }

    // Create feedback document
    const newFeedback = new Feedback({
      feedback,
      type,
      sentiment: {
        score: sentimentResult.score,
        label
      },
      userId: req.user._id,
      username: req.user.username
    });

    await newFeedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: newFeedback._id,
        feedback: newFeedback.feedback,
        type: newFeedback.type,
        sentiment: newFeedback.sentiment,
        createdAt: newFeedback.createdAt
      }
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Server error during feedback submission' });
  }
});

// Get user's own feedback history
router.get('/my-feedback', studentAuth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-userId');

    res.json({ feedbacks });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check attendance eligibility
router.get('/eligibility', studentAuth, async (req, res) => {
  try {
    const isEligible = req.user.attendancePercentage >= 75;
    
    res.json({
      isEligible,
      attendancePercentage: req.user.attendancePercentage,
      message: isEligible 
        ? 'You are eligible to submit feedback'
        : 'You must have at least 75% attendance to submit feedback'
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
