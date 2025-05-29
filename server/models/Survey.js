const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'multiple-choice', 'rating', 'checkbox'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: function() {
      return ['multiple-choice', 'checkbox'].includes(this.type);
    }
  }],
  isRequired: {
    type: Boolean,
    default: true
  }
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Survey', surveySchema);