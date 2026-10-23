const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: 'General'
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    default: 'Medium'
  },
  taskType: {
    type: String,
    default: 'Assignment' // Pwedeng 'Assignment' o 'Exam'
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);