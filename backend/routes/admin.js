const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard KPIs
router.get('/dashboard/kpis', adminAuth, async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFeedbacks = await Feedback.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const sentimentStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$sentiment.label',
          count: { $sum: 1 }
        }
      }
    ]);

    const positiveCount = sentimentStats.find(s => s._id === 'positive')?.count || 0;
    const overallSentiment = totalFeedbacks > 0 ? Math.round((positiveCount / totalFeedbacks) * 100) : 0;

    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const mostCommonCategory = categoryStats[0]?.count > 0 ? categoryStats[0]._id : 'N/A';

    const negativeCategoryStats = await Feedback.aggregate([
      { $match: { 'sentiment.label': 'negative' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryNeedingAttention = negativeCategoryStats[0]?.count > 0 ? negativeCategoryStats[0]._id : 'N/A';

    res.json({
      totalFeedbacks,
      recentFeedbacks,
      overallSentiment,
      mostCommonCategory,
      categoryNeedingAttention
    });
  } catch (error) {
    console.error('KPI calculation error:', error);
    res.status(500).json({ message: 'Server error calculating KPIs' });
  }
});

// Get sentiment breakdown
router.get('/dashboard/sentiment-breakdown', adminAuth, async (req, res) => {
  try {
    const sentimentBreakdown = await Feedback.aggregate([
      {
        $group: {
          _id: '$sentiment.label',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Feedback.countDocuments();
    
    const breakdown = sentimentBreakdown.map(item => ({
      label: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    res.json({ breakdown, total });
  } catch (error) {
    console.error('Sentiment breakdown error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sentiment by category
router.get('/dashboard/sentiment-by-category', adminAuth, async (req, res) => {
  try {
    const sentimentByCategory = await Feedback.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            sentiment: '$sentiment.label'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          sentiments: {
            $push: {
              sentiment: '$_id.sentiment',
              count: '$count'
            }
          }
        }
      }
    ]);

    res.json({ sentimentByCategory });
  } catch (error) {
    console.error('Sentiment by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submission trends
router.get('/dashboard/submission-trends', adminAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({ trends });
  } catch (error) {
    console.error('Submission trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get word cloud data from negative feedback
router.get('/dashboard/word-cloud', adminAuth, async (req, res) => {
  try {
    const negativeFeedbacks = await Feedback.find(
      { 'sentiment.label': 'negative' },
      { feedback: 1 }
    );

    // Simple word frequency analysis
    const wordFreq = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

    negativeFeedbacks.forEach(feedback => {
      const words = feedback.feedback.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
    });

    const wordCloud = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50)
      .map(([word, frequency]) => ({ word, frequency }));

    res.json({ wordCloud });
  } catch (error) {
    console.error('Word cloud error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance correlation data
router.get('/dashboard/attendance-correlation', adminAuth, async (req, res) => {
  try {
    const correlationData = await Feedback.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.role': 'student'
        }
      },
      {
        $project: {
          attendancePercentage: '$user.attendancePercentage',
          sentimentScore: '$sentiment.score',
          username: '$user.username'
        }
      }
    ]);

    res.json({ correlationData });
  } catch (error) {
    console.error('Attendance correlation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedback with filtering and pagination
router.get('/feedback', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      sentiment,
      username,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (sentiment && sentiment !== 'all') {
      filter['sentiment.label'] = sentiment;
    }
    
    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-userId');

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'username role attendancePercentage createdAt')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
