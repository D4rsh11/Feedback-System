const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  feedback: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['College', 'Faculty', 'Campus', 'Syllabus', 'Other']
  },
  sentiment: {
    score: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true,
      enum: ['positive', 'negative', 'neutral']
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
feedbackSchema.index({ type: 1, 'sentiment.label': 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ userId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);


