const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true,
  },
  classCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  instructor: {
    type: String,
    required: true,
    trim: true,
  },
  schedule: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    time: {
      type: String, // Format: "HH:MM - HH:MM"
    },
  },
  capacity: {
    type: Number,
    default: 30,
    min: 1,
  },
  currentEnrollment: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
classSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;